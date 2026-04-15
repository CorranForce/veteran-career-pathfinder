import { useAuth } from "@/_core/hooks/useAuth";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { PageFooter } from "@/components/PageFooter";
import { AdminActivityLog } from "@/components/AdminActivityLog";
import { AnnouncementManagement } from "@/components/AnnouncementManagement";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Package,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
  Eye,
  UserCog,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocation } from "wouter";
import ActivityFeed from "@/components/ActivityFeed";
import { ProductManagement } from "@/components/ProductManagement";
import { StripeHealthCard } from "@/components/StripeHealthCard";
import { BlogManagement } from "@/components/BlogManagement";
import { PlatformAgentCard } from "@/components/PlatformAgentCard";

export default function PlatformOwnerDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPurchasesDialog, setShowPurchasesDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Revenue Overview pagination state
  const [revPage, setRevPage] = useState(1);
  const REV_PAGE_SIZE = 5;

  // Fetch all users with pagination
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery(
    { page: currentPage, pageSize },
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );
  
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Fetch user purchases for selected user
  const { data: userPurchases, isLoading: purchasesLoading } = trpc.admin.getUserPurchases.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId && showPurchasesDialog }
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

  // Mutations
  const changeRole = trpc.admin.changeUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const suspendUser = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User suspended successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suspend user");
    },
  });

  const reactivateUser = trpc.admin.reactivateUser.useMutation({
    onSuccess: () => {
      toast.success("User reactivated successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate user");
    },
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      setUserToDelete(null);
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Handler functions
  const handleRoleChange = (userId: number, newRole: string) => {
    changeRole.mutate({ userId, role: newRole as "user" | "admin" | "platform_owner" });
  };

  const handleSuspend = (userId: number) => {
    suspendUser.mutate({ userId });
  };

  const handleReactivate = (userId: number) => {
    reactivateUser.mutate({ userId });
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser.mutate({ userId: userToDelete });
    }
  };

  const handleViewPurchases = (userId: number) => {
    setSelectedUserId(userId);
    setShowPurchasesDialog(true);
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter((u: any) => {
      const matchesSearch = 
        searchQuery === "" ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              subtitle: `+${analytics?.resumesThisMonth || 0} total`
            },
            {
              key: 'avg-ats-score',
              title: 'Avg ATS Score',
              icon: TrendingUp,
              value: analytics?.averageAtsScore ? Math.round(analytics.averageAtsScore) : '—',
              subtitle: 'Platform average'
            }
          ].map((card) => (
            <Card key={card.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Management */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Product Management</h2>
              <p className="text-sm text-muted-foreground">Manage products, pricing, and Stripe integration</p>
            </div>
            <Button onClick={() => setLocation("/admin/products")}>
              <Package className="h-4 w-4 mr-2" /> Manage Products
            </Button>
          </div>
          <StripeHealthCard />
        </div>

        {/* Activity Feed */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live platform activity feed</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Detailed revenue metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                {
                  key: 'total-rev',
                  title: 'Total Revenue',
                  value: `$${((revenueAnalytics?.totalRevenue || 0) / 100).toFixed(2)}`
                },
                {
                  key: 'monthly-rev',
                  title: 'This Month',
                  value: `$${((revenueAnalytics?.monthlyRevenue || 0) / 100).toFixed(2)}`
                },
                {
                  key: 'total-purchases',
                  title: 'Total Purchases',
                  value: revenueAnalytics?.totalPurchases || 0
                },
                {
                  key: 'avg-order',
                  title: 'Avg Order Value',
                  value: `$${((revenueAnalytics?.avgOrderValue || 0) / 100).toFixed(2)}`
                }
              ].map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Revenue Trend (Last 12 Months)</p>
                <p className="text-xs">Chart visualization coming soon</p>
              </div>
            </div>

            {/* Recent Purchases Table */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Recent Purchases</h3>
                  <p className="text-sm text-muted-foreground">Latest completed transactions</p>
                </div>
                {revenueAnalytics?.recentPurchases && revenueAnalytics.recentPurchases.length > REV_PAGE_SIZE && (
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min((revPage - 1) * REV_PAGE_SIZE + 1, revenueAnalytics.recentPurchases.length)}–{Math.min(revPage * REV_PAGE_SIZE, revenueAnalytics.recentPurchases.length)} of {revenueAnalytics.recentPurchases.length}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueAnalytics?.recentPurchases && revenueAnalytics.recentPurchases.length > 0 ? (
                      revenueAnalytics.recentPurchases
                        .slice((revPage - 1) * REV_PAGE_SIZE, revPage * REV_PAGE_SIZE)
                        .map((purchase: any) => (
                          <TableRow key={purchase.id}>
                            <TableCell className="font-medium">
                              {purchase.productType === "premium_prompt" ? "Premium Package" : "Pro Subscription"}
                            </TableCell>
                            <TableCell>
                              {format(new Date(purchase.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </TableCell>
                            <TableCell>${(purchase.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                                {purchase.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No purchases yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination controls */}
              {revenueAnalytics?.recentPurchases && revenueAnalytics.recentPurchases.length > REV_PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevPage((p) => Math.max(1, p - 1))}
                    disabled={revPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {revPage} of {Math.ceil(revenueAnalytics.recentPurchases.length / REV_PAGE_SIZE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevPage((p) => Math.min(Math.ceil(revenueAnalytics.recentPurchases.length / REV_PAGE_SIZE), p + 1))}
                    disabled={revPage >= Math.ceil(revenueAnalytics.recentPurchases.length / REV_PAGE_SIZE)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* LTV Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customer Lifetime Value (LTV) Tracker</CardTitle>
            <CardDescription>Analyze customer value and identify top spenders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                {
                  key: 'avg-revenue-per-user',
                  title: 'Avg Revenue Per User',
                  value: `$${((ltvAnalytics?.avgRevenuePerUser || 0) / 100).toFixed(2)}`,
                  subtitle: `From ${ltvAnalytics?.totalPayingCustomers || 0} paying customers`
                },
                {
                  key: 'repeat-purchase-rate',
                  title: 'Repeat Purchase Rate',
                  value: `${((ltvAnalytics?.repeatPurchaseRate || 0) * 100).toFixed(1)}%`,
                  subtitle: 'Customers who bought 2+ times'
                },
                {
                  key: 'total-paying-customers',
                  title: 'Total Paying Customers',
                  value: ltvAnalytics?.totalPayingCustomers || 0,
                  subtitle: 'Lifetime value customers'
                }
              ].map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Top Customers Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Top 10 Customers by Total Spend</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead>First Purchase</TableHead>
                      <TableHead>Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ltvAnalytics?.topCustomers && ltvAnalytics.topCustomers.length > 0 ? (
                      ltvAnalytics.topCustomers.map((customer: any, index: number) => (
                        <TableRow key={customer.userId}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell className="font-semibold">
                            ${(customer.totalSpent / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>{customer.purchaseCount}</TableCell>
                          <TableCell>
                            {format(new Date(customer.firstPurchase), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(customer.lastPurchase), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No customer data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="platform_owner">Platform Owner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {users?.filter((u: any) => u.status === "active").length || 0}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
              </div>
            </div>

            {/* Users Table */}
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
                      <TableHead>Status</TableHead>
                      <TableHead>Login Method</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((u: any) => (
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
                            <Badge
                              variant={
                                u.status === "active"
                                  ? "default"
                                  : u.status === "suspended"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{u.loginMethod || "—"}</TableCell>
                          <TableCell>
                            {format(new Date(u.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(u.lastSignedIn), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* Role Selector */}
                              <Select
                                value={u.role}
                                onValueChange={(value) => handleRoleChange(u.id, value)}
                                disabled={u.id === user.id}
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

                              {/* Actions Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={u.id === user.id}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewPurchases(u.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Purchases
                                  </DropdownMenuItem>
                                  {u.status === "active" && (
                                    <DropdownMenuItem onClick={() => handleSuspend(u.id)}>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend User
                                    </DropdownMenuItem>
                                  )}
                                  {u.status === "suspended" && (
                                    <DropdownMenuItem onClick={() => handleReactivate(u.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Reactivate User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(u.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!usersLoading && pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalUsers)} of {pagination.totalUsers} users
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="25">25 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                      <SelectItem value="100">100 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action will mark the user as deleted
              and they will no longer be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Purchases Dialog */}
      <Dialog open={showPurchasesDialog} onOpenChange={setShowPurchasesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Purchase History</DialogTitle>
            <DialogDescription>
              View all purchases made by this user
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {purchasesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userPurchases && userPurchases.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPurchases.map((purchase: any) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.productType === "premium_prompt" ? "Premium Package" : "Pro Subscription"}
                      </TableCell>
                      <TableCell>${(purchase.amount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(purchase.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No purchases found for this user
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Activity Log */}
      <div className="container mx-auto pb-8">
        <div className="space-y-6">
          <AdminActivityLog />
          <AnnouncementManagement />
          <BlogManagement />
          <PlatformAgentCard />
        </div>
      </div>
      <PageFooter />
    </div>
  );
}
