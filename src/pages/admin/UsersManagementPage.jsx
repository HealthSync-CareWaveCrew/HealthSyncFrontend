import { useEffect, useState } from "react";
import {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
} from "../../Redux/Api/api";
import { toast } from "react-toastify";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const payload = response?.data || {};
      const items = payload?.data?.users || payload?.users || [];
      setUsers(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error("Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setProcessingId(userId);
    try {
      await updateUserRole(userId, role);
      toast.success("User role updated.");
      await loadUsers();
    } catch (error) {
      toast.error("Unable to update role.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setProcessingId(userId);
    try {
      await toggleUserStatus(userId);
      toast.success("User status updated.");
      await loadUsers();
    } catch (error) {
      toast.error("Unable to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-black">Users Management</h3>
        <p className="text-sm text-black/60">
          Review users, update roles, and control account access.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary-2/20">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-primary-4/80 text-xs uppercase tracking-wide text-black/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-2/10 bg-primary-4/40">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-sm text-black/60"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-sm text-black/60"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-3 font-semibold text-black">
                    {user.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-black/70">{user.email}</td>
                  <td className="px-4 py-3 text-black/70 capitalize">
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black/70">
                    {user.isEmailVerified ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={processingId === user._id}
                        onClick={() =>
                          handleRoleChange(
                            user._id,
                            user.role === "admin" ? "user" : "admin",
                          )
                        }
                        className="rounded-full border border-primary-2/40 px-3 py-1 text-xs font-semibold text-black/70 hover:border-primary-2 disabled:cursor-not-allowed"
                      >
                        {user.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                      <button
                        type="button"
                        disabled={processingId === user._id}
                        onClick={() => handleToggleStatus(user._id)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed"
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagementPage;
