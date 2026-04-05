import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} from "../Redux/Features/adminSlice";
import TableGrid from "../libraries/TableGrid";
import { MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";
import PopupModal from "../components/PopupModal";

export default function AdminUserManagementPage() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        field: "name",
        header: "User Name",
        type: "text",
        filterType: "text",
        width: 220,
      },
      {
        field: "email",
        header: "Email Address",
        type: "text",
        filterType: "text",
        width: 250,
      },
      {
        field: "role",
        header: "Role",
        type: "status",
        width: 120,
        options: ["user", "admin"],
      },
      {
        field: "isActive",
        header: "Status",
        width: 130,
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        field: "actions",
        header: "Actions",
        width: 150,
        render: (row) => (
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(toggleUserStatus(row._id))}
              title="Toggle Active Status"
            >
              {row.isActive ? (
                <MdToggleOn className="text-2xl text-green-500" />
              ) : (
                <MdToggleOff className="text-2xl text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="text-red-500 hover:text-red-700"
              title="Delete User"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        ),
      },
    ],
    [dispatch],
  );

  return (
    <div className="p-4">
      <TableGrid
        title="User Management"
        description="View and manage all registered users, roles, and account statuses."
        data={users}
        columns={columns}
        loading={loading}
        fetchHistory={() => dispatch(getAllUsers())}
      />

      <PopupModal
        isOpen={!!deleteTarget}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await dispatch(deleteUser(deleteTarget._id));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
