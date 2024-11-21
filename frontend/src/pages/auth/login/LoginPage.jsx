import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { Link } from "react-router-dom";
import XSvg from "../../../components/X";

const LoginPage = () => {
  const [passwordEye, setPasswordEye] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const queryClient = useQueryClient();

  const {
    isError,
    isPending,
    mutate: loginMutation,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      const payload = {
        username,
        password,
      };
      try {
        const res = await fetch(`/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to login");
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEyeHideAndShow = () => {
    setPasswordEye(() => !passwordEye);
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col w-80" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type={passwordEye ? "password" : "text"}
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />

            {passwordEye ? (
              <IoEye
                size={20}
                className="cursor-pointer"
                onClick={handleEyeHideAndShow}
              />
            ) : (
              <IoMdEyeOff
                size={20}
                className="cursor-pointer"
                onClick={handleEyeHideAndShow}
              />
            )}
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Login"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
