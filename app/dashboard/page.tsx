import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  File,
  FileTextIcon,
} from "lucide-react";
import CurrentMoneySplitWidget from '@/components/CurrentMoneySplitWidget'
import GoalProgress from "@/components/Dashboard/GoalProgress";
import SplitBar from "@/components/Dashboard/SplitBar";
import StatCard from "@/components/Dashboard/StatCard";
import TransactionItem from "@/components/Dashboard/TransactionItem";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-(--background) shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-(--foreground) hover:text-(--foreground)"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-(--foreground)">
              Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Sent"
            value="$1,200"
            detail1="+$300"
            detail1Color="text-red-500"
            detail2="+25%"
            icon={Send}
            showTrend={true}
          />
          <StatCard
            title="Savings"
            value="$360"
            detail1="+$90"
            detail1Color="text-red-500"
            detail2="+33%"
            icon={PiggyBank}
            showTrend={true}
          />
          <StatCard
            title="Bills Paid"
            value="$180"
            detail1="3 bills"
            detail2="This month"
            icon={FileText}
          />
          <StatCard
            title="Insurance"
            value="$60"
            detail1="2 policies"
            detail2="Active"
            icon={Shield}
          />
        </div>

        {/* Money Split Visualization */}
        {/* Money Split Visualization */}
        <div className="mb-8">
          <CurrentMoneySplitWidget />
        </div>

        {/* Recent Transactions */}
        <div
          className="rounded-xl shadow-md p-6 mb-8"
          style={{ backgroundImage: "var(--card)" }}
        >
          <h2 className="text-xl font-bold text-(--foreground) mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            <TransactionItem
              date="2024-01-15"
              description="Remittance to Family"
              amount="$300"
              status="completed"
            />
            <TransactionItem
              date="2024-01-10"
              description="Bill Payment - Electricity"
              amount="$50"
              status="completed"
            />
            <TransactionItem
              date="2024-01-08"
              description="Savings Goal - Education"
              amount="$100"
              status="completed"
            />
          </div>
          <div className="mt-6">
            <Link
              href="/transactions"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Transactions →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings Goals Progress */}
          <div
            className="rounded-2xl shadow-md p-6 border border-[#FFFFFF14] hover:border-white/30 transition-colors duration-300"
            style={{ backgroundImage: "var(--card)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span>
                <PiggyBank className="w-6 h-6 text-[var(--accent)]" />
              </span>
              <h2 className="text-xl font-bold text-(--foreground)">
                Savings by Goals
              </h2>
            </div>
            <div className="space-y-4">
              <GoalProgress
                name="Emergency Fund"
                current={331.2}
                target={720}
                gradient={{ from: "#B91C1C", to: "#991B1B" }}
              />
              <GoalProgress
                name="Education Fund"
                current={194}
                target={550}
                gradient={{ from: "#991B1B", to: "#7F1D1D" }}
              />
              <GoalProgress
                name="Medical Fund"
                current={58.9}
                target={310}
                gradient={{ from: "#7F1D1D", to: "#5F1515" }}
              />
            </div>
          </div>

          {/* Bills by Type */}
          <div
            className="rounded-2xl shadow-md p-6 border border-[#FFFFFF14] hover:border-white/30 transition-colors duration-300"
            style={{ backgroundImage: "var(--card)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span>
                <FileTextIcon className="w-6 h-6 text-[var(--accent)]" />
              </span>
              <h2 className="text-xl font-bold text-(--foreground)">
                Bills by Type
              </h2>
            </div>
            <div className="space-y-4">
              <GoalProgress
                name="Electricity"
                current={133}
                target={285}
                gradient={{ from: "#991B1B", to: "#7F1D1D" }}
              />
              <GoalProgress
                name="Water"
                current={48}
                target={180}
                gradient={{ from: "#7F1D1D", to: "#5F1515" }}
              />
              <GoalProgress
                name="Internet"
                current={22}
                target={120}
                gradient={{ from: "#5F1515", to: "#4F1111" }}
              />
              <GoalProgress
                name="Phone"
                current={14}
                target={100}
                gradient={{ from: "#5F1515", to: "#4F1111" }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

