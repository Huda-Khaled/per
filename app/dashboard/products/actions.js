'use server';

// 1. استيراد الأدوات الصحيحة
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';


export async function addProduct(prevState, formData) {
  // 2. التعديل الرئيسي هنا: إنشاء عميل Supabase باستخدام cookies
  const supabase = createServerActionClient({ cookies });
  
  // الآن، supabase.auth سيكون معرفًا بشكل صحيح
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'غير مصرح لك بالقيام بهذا الإجراء.', success: false };
  }

  // استخراج البيانات من الفورم
  const name = formData.get('name');
  const description = formData.get('description');
  const price = formData.get('price');
  const imageFile = formData.get('image');

  // التحقق من صحة البيانات
  if (!name || !price || !imageFile || imageFile.size === 0) {
    return { message: "الاسم، السعر، والصورة حقول مطلوبة.", success: false };
  }

  // رفع الصورة إلى Supabase Storage
  const fileExtension = imageFile.name.split('.').pop();
  const fileName = `public/${uuidv4()}.${fileExtension}`; 
  
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, imageFile);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return { message: 'فشل في رفع الصورة. يرجى مراجعة صلاحيات التخزين (Storage RLS).', success: false };
  }

  // الحصول على الرابط العام للصورة
  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  
  const imageUrl = publicUrlData.publicUrl;

  // إضافة المنتج إلى قاعدة البيانات مع رابط الصورة
  const { error: insertError } = await supabase
    .from('products')
    .insert([
      { 
        name, 
        description, 
        price: parseFloat(price),
        user_id: user.id, 
        image_url: imageUrl
      }
    ]);

  // معالجة الخطأ في حال فشل الإضافة
  if (insertError) {
    console.error('Insert Error:', insertError);
    await supabase.storage.from('product-images').remove([fileName]);
    return { message: 'فشل في إضافة المنتج لقاعدة البيانات. قد تكون هناك مشكلة في صلاحيات الجدول (RLS).', success: false };
  }

  // عند النجاح
  revalidatePath('/dashboard/products');
  revalidatePath('/');

  return { message: 'تمت إضافة المنتج بنجاح!', success: true };
}