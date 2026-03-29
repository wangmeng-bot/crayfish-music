import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 请替换为您自己的 Supabase 项目配置
// 获取地址: https://supabase.com/dashboard -> 您的项目 -> Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查是否已配置 - 直接检查环境变量
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return url && url !== 'YOUR_SUPABASE_URL' && key && key !== 'YOUR_SUPABASE_ANON_KEY'
}

