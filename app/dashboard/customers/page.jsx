'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '../../../lib/supabaseClient';
import CustomToaster from '../products/components/CustomToaster';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, area, plot, street, house, order_count, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setCustomers(data || []);
      } catch (error) {
        console.error('Error loading customers:', error);
        setToast({
          type: 'error',
          message: 'حدث خطأ أثناء تحميل بيانات العملاء'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // تنسيق العنوان مع إضافة house
  const formatAddress = (customer) => {
    const addressParts = [];
    if (customer.area) addressParts.push(customer.area);
    if (customer.plot) addressParts.push(`قطعة ${customer.plot}`);
    if (customer.street) addressParts.push(`شارع ${customer.street}`);
    if (customer.house) addressParts.push(`منزل ${customer.house}`);
    
    return addressParts.length > 0 ? addressParts.join(' - ') : 'غير متوفر';
  };

  // تقصير نص العنوان للشاشات المتوسطة
  const formatShortAddress = (customer) => {
    const addressParts = [];
    if (customer.area) addressParts.push(customer.area);
    if (customer.plot) addressParts.push(`ق${customer.plot}`);
    return addressParts.length > 0 ? addressParts.join(' - ') : 'غير متوفر';
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">بيانات العملاء</h1>

      {loading ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 text-sm sm:text-base">لا توجد بيانات للعملاء بعد.</p>
        </div>
      ) : (
        <>
          {/* عرض جدول العملاء للأجهزة المتوسطة والكبيرة */}
          <div className="bg-white rounded-lg shadow overflow-x-auto hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    اسم العميل
                  </th>
                  <th scope="col" className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهاتف
                  </th>
                  <th scope="col" className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th scope="col" className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    عدد الطلبات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                      {customer.name}
                    </td>
                    <td className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      <a href={`tel:${customer.phone}`} className="hover:text-primary-600 transition-colors">
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-xs sm:text-sm text-gray-500">
                      {/* عنوان كامل للشاشات الكبيرة */}
                      <span className="hidden md:block">
                        {formatAddress(customer)}
                      </span>
                      {/* عنوان مختصر للأجهزة اللوحية */}
                      <span className="sm:block md:hidden truncate max-w-[150px]">
                        {formatShortAddress(customer)}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-3 md:px-4 lg:px-6 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.order_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* عرض الكروت للموبايل فقط */}
          <div className="sm:hidden space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{customer.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {customer.order_count || 0} طلب
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${customer.phone}`} className="text-primary-600">
                      {customer.phone}
                    </a>
                  </div>
                  <div className="flex items-start text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="leading-tight">{formatAddress(customer)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}