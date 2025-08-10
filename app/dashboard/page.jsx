'use client';
export const runtime = "nodejs";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState(null);

  // First, check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log("Dashboard - auth check:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          router.push('/login');
          return;
        }
        
        setAuthChecking(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        setError('حدث خطأ أثناء التحقق من تسجيل الدخول');
        setAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Then, load dashboard data after authentication is confirmed
  useEffect(() => {
    if (authChecking) return; // Don't load data until auth check is complete
    
    const loadDashboardStats = async () => {
      setLoading(true);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Get counts
        const [
          productsResponse,
          ordersResponse,
          customersResponse,
          recentOrdersResponse
        ] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('orders').select('id', { count: 'exact' }),
          supabase.from('customers').select('id', { count: 'exact' }),
          supabase.from('orders')
            .select(`
              id,
              created_at,
              customers:customer_id (name),
              order_items!inner (quantity, products:product_id (price))
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);
        
        // Calculate total for each order
        const recentOrders = recentOrdersResponse.data?.map(order => {
          const total = order.order_items.reduce((sum, item) => {
            return sum + (item.quantity * item.products.price);
          }, 0);
          
          return {
            ...order,
            total
          };
        }) || [];
        
        setStats({
          totalProducts: productsResponse.count || 0,
          totalOrders: ordersResponse.count || 0,
          totalCustomers: customersResponse.count || 0,
          recentOrders
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardStats();
  }, [authChecking]);

  if (authChecking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">لوحة المعلومات</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase">إجمالي المنتجات</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <div className="mt-4">
                <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-800">
                  عرض كافة المنتجات &rarr;
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase">إجمالي الطلبات</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <div className="mt-4">
                <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800">
                  عرض كافة الطلبات &rarr;
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase">إجمالي العملاء</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <div className="mt-4">
                <Link href="/dashboard/customers" className="text-blue-600 hover:text-blue-800">
                  عرض كافة العملاء &rarr;
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">أحدث الطلبات</h2>
            </div>
            
            {stats.recentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رقم الطلب
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      العميل
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      التاريخ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المبلغ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الإجراء
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customers.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total.toFixed(2)} دينار
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          href={`/dashboard/orders#${order.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                لا توجد طلبات حتى الآن
              </div>
            )}
            
            <div className="px-6 py-4 border-t">
              <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800">
                عرض كافة الطلبات &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}