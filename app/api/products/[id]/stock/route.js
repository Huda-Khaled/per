// app/api/products/[id]/stock/route.js
import { createSupabaseAdmin } from "../../../../../lib/supabaseClient";

export async function PATCH(request, { params }) {
  console.log("=== بداية API تحديث المخزون ===");

  try {
    const { id } = params;
    const { in_stock } = await request.json();

    console.log("البيانات المستلمة:", {
      id,
      idType: typeof id,
      in_stock,
      in_stock_type: typeof in_stock,
    });

    // التحقق من صحة البيانات
    if (!id) {
      return Response.json(
        { error: "معرف المنتج مطلوب", success: false },
        { status: 400 }
      );
    }

    if (typeof in_stock === "undefined" || in_stock === null) {
      return Response.json(
        { error: "قيمة حالة المخزون مطلوبة", success: false },
        { status: 400 }
      );
    }

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return Response.json(
        { error: "معرف المنتج غير صالح", success: false },
        { status: 400 }
      );
    }

    const booleanValue = Boolean(in_stock);
    console.log("قيم محولة:", { productId, booleanValue });

    // استخدام createSupabaseAdmin لتجاوز RLS
    console.log("=== التحقق من وجود المنتج باستخدام Admin Client ===");
    const supabaseAdmin = createSupabaseAdmin();
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from("products")
      .select("id, title, in_stock")
      .eq("id", productId)
      .single();

    console.log("نتيجة البحث:", { existingProduct, checkError });

    if (checkError) {
      console.error("خطأ في البحث:", checkError);
      return Response.json(
        {
          error: `خطأ في البحث: ${checkError.message}`,
          success: false,
          details: checkError,
        },
        { status: checkError.code === "PGRST116" ? 404 : 500 }
      );
    }

    if (!existingProduct) {
      return Response.json(
        { error: `المنتج غير موجود (ID: ${productId})`, success: false },
        { status: 404 }
      );
    }

    // تحديث المنتج باستخدام Admin Client
    console.log("=== تحديث المنتج باستخدام Admin Client ===");
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("products")
      .update({
        in_stock: booleanValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("*");

    console.log("نتيجة التحديث:", {
      updateData,
      updateError,
      dataLength: updateData?.length,
    });

    if (updateError) {
      console.error("خطأ في التحديث:", updateError);
      return Response.json(
        {
          error: `فشل في تحديث المنتج: ${updateError.message}`,
          success: false,
          details: updateError,
        },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      console.error("⚠️ لم يتم تحديث أي صفوف");
      return Response.json(
        {
          error: "فشل في تحديث المنتج - لم يتم العثور على المنتج أو تحديثه",
          success: false,
          productId,
        },
        { status: 404 }
      );
    }

    console.log("✅ نجح التحديث");
    return Response.json({
      success: true,
      data: updateData[0],
      updated: true,
      message: "تم تحديث حالة المخزون بنجاح",
      previous_status: existingProduct.in_stock,
      new_status: booleanValue,
    });
  } catch (error) {
    console.error("=== خطأ غير متوقع ===", error);
    return Response.json(
      {
        error: "حدث خطأ غير متوقع",
        success: false,
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
