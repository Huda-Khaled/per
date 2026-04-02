import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, total } = body;
    const itemsList = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.salePrice} دينار</td>
      </tr>
    `,
      )
      .join("");

    const { data, error } = await resend.emails.send({
      from: "orders@rose-stare.com",
      to: "Kwt.3otorat@gmail.com",
      subject: "🛍️ طلب جديد!",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">طلب جديد 🛍️</h2>
          
          <h3>بيانات العميل:</h3>
          <p><strong>الاسم:</strong> ${customerName}</p>
          <p><strong>الهاتف:</strong> ${customerPhone}</p>
          <p><strong>العنوان:</strong> ${customerAddress}</p>
          
          <h3>المنتجات:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; border: 1px solid #ddd;">المنتج</th>
              <th style="padding: 8px; border: 1px solid #ddd;">الكمية</th>
              <th style="padding: 8px; border: 1px solid #ddd;">السعر</th>
            </tr>
            ${itemsList}
          </table>
          
          <h3 style="color: #16a34a;">الإجمالي: ${total} دينار</h3>
        </div>
      `,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
