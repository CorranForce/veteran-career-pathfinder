import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User, Mail, Calendar, Shield, Key, AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast as showToast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const toast = (options: { title: string; description: string; variant?: string }) => {
    if (options.variant === "destructive") {
      showToast.error(options.title, { description: options.description });
    } else {
      showToast.success(options.title, { description: options.description });
    }
  };

  const { data: personalInfo, isLoading: infoLoading, refetch } = trpc.profile.getPersonalInfo.useQuery(undefined, {
    enabled: !!user,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile picture state
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Email change state
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Account deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const updatePersonalInfoMutation = trpc.profile.updatePersonalInfo.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      setIsEditing(false);
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = trpc.profile.uploadProfilePicture.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
      setUploadingPicture(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      setUploadingPicture(false);
    },
  });

  const requestEmailChangeMutation = trpc.profile.requestEmailChange.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Verification email sent to your new email address. Please check your inbox.",
      });
      setShowEmailChangeForm(false);
      setNewEmail("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request email change",
        variant: "destructive",
      });
    },
  });

  const verifyEmailChangeMutation = trpc.profile.verifyEmailChange.useMutation({
    onSuccess: () => {
      toast({
        title: "Email Updated",
        description: "Your email address has been successfully updated.",
      });
      refetch();
      // Remove token from URL
      window.history.replaceState({}, document.title, "/profile");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify email change",
        variant: "destructive",
      });
      // Remove token from URL
      window.history.replaceState({}, document.title, "/profile");
    },
  });

  const deleteAccountMutation = trpc.profile.deleteAccount.useMutation({
    onSuccess: (data) => {
      // Download user data export
      const dataStr = JSON.stringify(data.dataExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pathfinder-data-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Account Deleted",
        description: "Your account has been deleted and your data has been downloaded.",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (personalInfo) {
      setName(personalInfo.name || "");
    }
  }, [personalInfo]);

  // Handle email verification from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get("verify_email");
    
    if (verifyToken && user) {
      verifyEmailChangeMutation.mutate({ token: verifyToken });
    }
  }, [user]);

  useEffect(() => {
    if (personalInfo) {
      const nameChanged = name !== (personalInfo.name || "");
      setHasChanges(nameChanged);
    }
  }, [name, personalInfo]);

  const handleSave = () => {
    if (!hasChanges) return;

    updatePersonalInfoMutation.mutate({
      name,
    });
  };

  const handleCancel = () => {
    setName(personalInfo?.name || "");
    setIsEditing(false);
    setHasChanges(false);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "File must be an image",
        variant: "destructive",
      });
      return;
    }

    setUploadingPicture(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadProfilePictureMutation.mutate({
        imageData: base64,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
      setUploadingPicture(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEmailChange = () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    requestEmailChangeMutation.mutate({ newEmail });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    deleteAccountMutation.mutate({ confirmation: deleteConfirmation });
  };

  if (authLoading || infoLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthenticatedNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!personalInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthenticatedNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load profile information</p>
        </div>
      </div>
    );
  }

  const initials = personalInfo.name
    ? personalInfo.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <AuthenticatedNav />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>

          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={personalInfo.profilePicture || undefined} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {uploadingPicture ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingPicture}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click the camera icon to upload a new picture</p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 200x200px, max 5MB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || updatePersonalInfoMutation.isPending}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </Label>
                <Input
                  id="email"
                  value={personalInfo.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                  </Label>
                  <Input
                    value={new Date(personalInfo.createdAt).toLocaleDateString()}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Login Method
                    </div>
                  </Label>
                  <Input
                    value={personalInfo.loginMethod || "N/A"}
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updatePersonalInfoMutation.isPending}
                  >
                    {updatePersonalInfoMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={updatePersonalInfoMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Change Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Change Email Address
                </div>
              </CardTitle>
              <CardDescription>Update your email address with verification</CardDescription>
            </CardHeader>
            <CardContent>
              {!showEmailChangeForm ? (
                <Button onClick={() => setShowEmailChangeForm(true)} variant="outline">
                  Change Email
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Email Verification Required</AlertTitle>
                    <AlertDescription>
                      We'll send a verification link to your new email address. You must click the link to complete the change.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={requestEmailChangeMutation.isPending}
                      placeholder="Enter your new email address"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleEmailChange}
                      disabled={!newEmail || requestEmailChangeMutation.isPending}
                    >
                      {requestEmailChangeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Verification Email"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowEmailChangeForm(false);
                        setNewEmail("");
                      }}
                      variant="outline"
                      disabled={requestEmailChangeMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card (only for email/password users) */}
          {personalInfo.loginMethod === "email" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </div>
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={changePasswordMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={changePasswordMutation.isPending}
                        placeholder="At least 8 characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={changePasswordMutation.isPending}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={
                          !currentPassword ||
                          !newPassword ||
                          !confirmPassword ||
                          changePasswordMutation.isPending
                        }
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        variant="outline"
                        disabled={changePasswordMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Danger Zone - Account Deletion */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </div>
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted, including your profile, resumes, and purchase history.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="mt-4"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your data will be exported and downloaded before deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Final Warning</AlertTitle>
              <AlertDescription>
                All your data will be permanently deleted. We'll download a copy of your data before deletion.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                disabled={deleteAccountMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
              }}
              variant="outline"
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              disabled={deleteConfirmation !== "DELETE" || deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
