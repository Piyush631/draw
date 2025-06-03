"use client";
import { useForm } from "react-hook-form";
import { BACKEND_URL } from "@/config";
import { useState } from "react";
import axios from "axios";
import z from "zod";
import { useRouter } from "next/navigation";
import { Header } from "../component/landing/Header";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  email: z
    .string()
    .email()
    .min(5, { message: "email is too short" })
    .max(30, { message: "Email is very large" }),
  name: z
    .string()
    .min(4, { message: "name is too small" })
    .max(30, { message: "Name is very big" }),
  password: z
    .string()
    .min(5, { message: "password is too short" })
    .max(30)
    .regex(/^(?=.*[A-Z]).{8,}$/, {
      message:
        "Should Contain at least one uppercase letter and have a minimum length of 5 characters.",
    }),
});

type formData = z.infer<typeof formSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: formData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/signup`, {
        email: data.email,
        name: data.name,
        password: data.password,
      });

      if (response.data.msg === "User created successfully") {
        toast.success("Signup successful!");
        router.push("/signin");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.response?.status === 402) {
        toast.error("User already exists");
      } else {
        toast.error(error.response?.data?.msg || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <div className="bg-gray-200 lg:pt-8 md:pt-16 pt-20 overflow-hidden h-screen mt-12 flex justify-center w-full">
        <div className="lg:w-[40%] h-full hidden lg:block">
          <img src="./signin2.jpg" className="" alt="" />
        </div>
        <div className="px-6 py-4 flex flex-col bg-white pt-12 gap-4 lg:h-full md:h-1/2 lg:w-[40%] w-full md:w-1/2">
          <div className="flex flex-col px-16 gap-1">
            <div className="text-3xl font-semibold">Welcome back</div>
            <div className="text-black/70">
              Welcome back! please create your account
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex px-16 flex-col gap-1">
              <div>
                Email <span className="text-red-600">*</span>
              </div>
              <input
                {...register("email")}
                type="text"
                className="px-2 py-2 border-gray-300 border-1 rounded-xl"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="flex px-16 flex-col gap-1">
              <div>
                Name <span className="text-red-600">*</span>
              </div>
              <input
                {...register("name")}
                type="text"
                className="px-2 py-2 border-gray-300 border-1 rounded-xl"
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex px-16 flex-col gap-1">
              <div>
                Password <span className="text-red-600">*</span>
              </div>
              <input
                {...register("password")}
                type="password"
                className="px-2 py-2 border-gray-300 border-1 rounded-xl"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="px-16">
              <button
                type="submit"
                className="w-full bg-black mt-3 px-2 py-2 text-white cursor-pointer rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center">
                    <img src="./1488.gif" className="h-6 w-6 text-center" alt="loading" />
                  </div>
                ) : (
                  "Signup"
                )}
              </button>
            </div>
          </form>
          <div className="px-16">
            Already have a account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => {
                router.push("/signin");
              }}
            >
              Signin
            </span>
          </div>

          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Slide}
          />
        </div>
      </div>
    </div>
  );
}
