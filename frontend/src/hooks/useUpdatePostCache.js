import { useQueryClient } from "@tanstack/react-query";

const useUpdatePostCache = () => {
  const queryClient = useQueryClient();

  const updateCache = ({ postId, updater }) => {
    // This is not the best UX, be it will refetch all posts
    // queryClient.invalidateQueries({ queryKey: ["posts"] });

    // instead, update the cache directly for that post
    queryClient.setQueryData(["posts"], (oldData) => {
      if (!Array.isArray(oldData)) return []; // Ensure it's an array
      return oldData.map((post) => {
        if (post._id === postId) {
          return updater(post);
        }
        return post;
      });
    });
  };

  return { updateCache };
};

export default useUpdatePostCache;
