import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

import { HiOutlineDotsVertical } from "react-icons/hi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteSingleNotification } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notification deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown dropdown-left">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex justify-between gap-2 p-4">
              <div className="flex items-center gap-2 flex-grow">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-primary" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                <Link
                  to={`/profile/${notification.from.username}`}
                  className="flex items-center gap-1"
                >
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                      />
                    </div>
                  </div>
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>
                  {notification.type === "follow"
                    ? "followed you"
                    : "liked your post"}
                </Link>
              </div>

              <div className="dropdown dropdown-left">
                <div tabIndex={0} role="button" className="m-1 ">
                  <HiOutlineDotsVertical className="w-6 h-6 text-gray-500 cursor-pointer" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a
                      onClick={() => deleteSingleNotification(notification._id)}
                    >
                      Delete Single Notification
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
