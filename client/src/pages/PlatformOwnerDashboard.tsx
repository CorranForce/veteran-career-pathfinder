import { useAuth } from "@/_core/hooks/useAuth";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Loader2,
  Shield,
  Home,
  BarChart3,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocation } from "wouter";
import ActivityFeed from "@/components/ActivityFeed";
import { ProductManagement } from "@/components/ProductManagement";

export default function PlatformOwnerDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch all users
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );

  // Fetch site analytics
  const { data: analytics, isLoading: analyticsLoading } = trpc.admin.getSiteAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );

  // Fetch revenue analytics
  const { data: revenueAnalytics, isLoading: revenueLoading } = trpc.admin.getRevenueAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );

  // Fetch LTV analytics
  const { data: ltvAnalytics, isLoading: ltvLoading } = trpc.admin.getLTVAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );

  // Change user role mutation
  const changeRole = trpc.admin.changeUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not platform owner
  if (!isAuthenticated || user?.role !== "platform_owner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page
          </p>
          <Button onClick={() => setLocation("/tools")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    changeRole.mutate({ userId, role: newRole as "user" | "admin" | "platform_owner" });
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Owner Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, view analytics, and configure site settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              key: 'total-users',
              title: 'Total Users',
              icon: Users,
              value: analytics?.totalUsers || 0,
              subtitle: `+${analytics?.newUsersThisMonth || 0} new this month`
            },
            {
              key: 'total-revenue',
              title: 'Total Revenue',
              icon: DollarSign,
              value: `$${((analytics?.totalRevenue || 0) / 100).toFixed(2)}`,
              subtitle: 'Total revenue'
            },
            {
              key: 'resumes-analyzed',
              title: 'Resumes Analyzed',
              icon: FileText,
              value: analytics?.totalResumes || 0,
              subtitle: `+${analytics?.totalResumes || 0} total`
            },
            {
              key: 'avg-ats-score',
              title: 'Avg ATS Score',
              icon: TrendingUp,
              value: typeof analytics?.averageAtsScore === 'number' ? analytics.averageAtsScore.toFixed(1) : "—",
              subtitle: 'Platform average'
            }
          ].map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {card.subtitle}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Product Management */}
        <div className="mb-8">
          <ProductManagement />
        </div>

        {/* Activity Feed */}
        <ActivityFeed />

        {/* Revenue Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Detailed revenue metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'total-revenue', label: 'Total Revenue', value: `$${((revenueAnalytics?.totalRevenue || 0) / 100).toFixed(2)}` },
                      { key: 'monthly-revenue', label: 'This Month', value: `$${((revenueAnalytics?.monthlyRevenue || 0) / 100).toFixed(2)}` },
                      { key: 'total-purchases', label: 'Total Purchases', value: `${revenueAnalytics?.totalPurchases || 0}` },
                      { key: 'avg-order', label: 'Avg Order Value', value: `$${((revenueAnalytics?.avgOrderValue || 0) / 100).toFixed(2)}` }
                    ].map(metric => (
                      <div key={metric.key}>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Revenue by Month Chart */}
                  {revenueAnalytics?.revenueByMonth && revenueAnalytics.revenueByMonth.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-4">Revenue Trend (Last 12 Months)</p>
                      <div className="space-y-2">
                        {revenueAnalytics.revenueByMonth.map((item: any) => (
                          <div key={item.month} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-20">{item.month}</span>
                            <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                              <div
                                className="bg-primary h-full flex items-center justify-end pr-2"
                                style={{
                                  width: `${Math.min((item.revenue / (revenueAnalytics.totalRevenue || 1)) * 100 * 12, 100)}%`,
                                }}
                              >
                                <span className="text-xs text-primary-foreground font-medium">
                                  ${(item.revenue / 100).toFixed(0)}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {item.count} sales
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Latest completed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : revenueAnalytics?.recentPurchases && revenueAnalytics.recentPurchases.length > 0 ? (
                <div className="space-y-4">
                  {revenueAnalytics.recentPurchases.map((purchase: any) => (
                    <div key={purchase.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {purchase.productType === "premium_prompt" ? "Premium Package" : "Pro Subscription"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(purchase.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${(purchase.amount / 100).toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No purchases yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Lifetime Value Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customer Lifetime Value (LTV) Tracker</CardTitle>
            <CardDescription>Analyze customer value and identify top spenders</CardDescription>
          </CardHeader>
          <CardContent>
            {ltvLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* LTV Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: 'avg-revenue',
                      title: 'Avg Revenue Per User',
                      value: `$${((ltvAnalytics?.avgRevenuePerUser || 0) / 100).toFixed(2)}`,
                      subtitle: `From ${ltvAnalytics?.totalPayingCustomers || 0} paying customers`
                    },
                    {
                      key: 'repeat-rate',
                      title: 'Repeat Purchase Rate',
                      value: `${(ltvAnalytics?.repeatPurchaseRate || 0).toFixed(1)}%`,
                      subtitle: 'Customers who bought 2+ times'
                    },
                    {
                      key: 'total-customers',
                      title: 'Total Paying Customers',
                      value: ltvAnalytics?.totalPayingCustomers || 0,
                      subtitle: 'Lifetime value customers'
                    }
                  ].map(metric => (
                    <Card key={metric.key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {metric.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.subtitle}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Top Customers Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Top 10 Customers by Total Spend</h3>
                  {ltvAnalytics?.topCustomers && ltvAnalytics.topCustomers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Total Spent</TableHead>
                            <TableHead className="text-right">Purchases</TableHead>
                            <TableHead>First Purchase</TableHead>
                            <TableHead>Last Purchase</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ltvAnalytics.topCustomers.map((customer: any, index: number) => (
                            <TableRow key={customer.userId}>
                              <TableCell>
                                <Badge variant={index === 0 ? "default" : "outline"}>
                                  #{index + 1}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{customer.name}</TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell className="text-right font-bold">
                                ${(customer.totalSpent / 100).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">{customer.purchaseCount}</TableCell>
                              <TableCell>
                                {format(new Date(customer.firstPurchase), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                {format(new Date(customer.lastPurchase), "MMM d, yyyy")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No customer data available yet</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || "—"}</TableCell>
                          <TableCell>{u.email || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === "platform_owner"
                                  ? "default"
                                  : u.role === "admin"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(u.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(u.lastSignedIn), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(value) => handleRoleChange(u.id, value)}
                              disabled={u.id === user.id} // Can't change own role
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="platform_owner">Platform Owner</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
