import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatCurrency, cn } from '../../lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Printer,
  Loader2,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const res = await api.getFinanceReports()
      setData(res)
    } catch (err) {
      console.error('Failed to load financial reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  const summary = data?.summary || {
    totalRevenue: 380000,
    totalExpenses: 95000,
    netIncome: 285000,
    margin: 75,
  }

  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Jan', revenue: 45000, expenses: 12000, net: 33000 },
    { month: 'Feb', revenue: 60000, expenses: 15000, net: 45000 },
    { month: 'Mar', revenue: 75000, expenses: 18000, net: 57000 },
    { month: 'Apr', revenue: 90000, expenses: 22000, net: 68000 },
    { month: 'May', revenue: 110000, expenses: 28000, net: 82000 },
  ]

  const expenseCategories = data?.expenseCategories || [
    { category: 'Cloud & Infrastructure', total: 45000 },
    { category: 'Contractor Sprints', total: 30000 },
    { category: 'Software Tooling & AI APIs', total: 12000 },
    { category: 'Operational & Admin', total: 8000 },
  ]

  const revenueCategories = data?.revenueCategories || [
    { category: 'Full-Stack Architecture', total: 180000 },
    { category: 'Enterprise Retainers', total: 120000 },
    { category: 'FinTech Integrations', total: 80000 },
  ]

  const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48']
  const REVENUE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669']

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Financial Statements & Profit & Loss</h1>
          <p className="page-subtitle">
            Executive overview of enterprise profit margins, monthly cash flow, and cost distribution
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-outline text-xs h-9 px-3 inline-flex items-center gap-1.5"
        >
          <Printer size={14} />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* P&L Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Total Revenue
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <span className="text-2xs text-surface-400 mt-0.5 block">Lifetime billing</span>
        </div>

        <div className="card p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Total Operational Costs
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <span className="text-2xs text-surface-400 mt-0.5 block">Infrastructure & tooling</span>
        </div>

        <div className="card p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Net Income (EBITDA)
          </span>
          <div className={cn(
            'text-2xl font-bold mt-1',
            summary.netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {formatCurrency(summary.netIncome)}
          </div>
          <span className="text-2xs text-surface-400 mt-0.5 block">Retained earnings</span>
        </div>

        <div className="card p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Operating Margin
          </span>
          <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {summary.margin}%
          </div>
          <span className="text-2xs text-surface-400 mt-0.5 block">High-leverage solo founder</span>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
              Monthly Cash Inflow vs Outflow
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Contract receipts vs operating infrastructure costs per month
            </p>
          </div>
        </div>
        <div className="card-content pt-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                <Bar dataKey="net" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Net Operating Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdowns Row: Expenses Categories & Revenue Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
              Cost Allocation by Category
            </h2>
          </div>
          <div className="card-content space-y-4">
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {expenseCategories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="divide-y divide-surface-100 dark:divide-surface-800 pt-2">
              {expenseCategories.map((cat: any, idx: number) => (
                <div key={cat.category} className="py-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}
                    />
                    {cat.category}
                  </span>
                  <span className="font-bold text-surface-900 dark:text-surface-100">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
              Revenue Stream Diversification
            </h2>
          </div>
          <div className="card-content space-y-4">
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {revenueCategories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="divide-y divide-surface-100 dark:divide-surface-800 pt-2">
              {revenueCategories.map((cat: any, idx: number) => (
                <div key={cat.category} className="py-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: REVENUE_COLORS[idx % REVENUE_COLORS.length] }}
                    />
                    {cat.category}
                  </span>
                  <span className="font-bold text-surface-900 dark:text-surface-100">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
