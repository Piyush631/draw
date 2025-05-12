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
const formSchema = z.object({
  email: z
    .string()
    .email()
    .min(5, { message: "email is too short" })
    .max(30, { message: "Email is very large" }),
});
type formData = z.infer<typeof formSchema>;
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showotp, setShowotp] = useState(false);
  const router = useRouter();
  async function verifyOtp() {
    setLoading(true);
    const response = await axios.post(`${BACKEND_URL}/verify-otp`, {
      email: email,
      otp: otp,
    });
    setLoading(false);
    if (response.data.token) {
      toast.success("Login successfully");
      localStorage.setItem("token", response.data.token);
      router.push("/room");
    } else {
      toast.error("Invalid username and password");
    }
  }
  async function SignOtp() {
    setLoading(true);
    const response = await axios.post(`${BACKEND_URL}/email-login`, {
      email: email,
    });
    setLoading(false);
    if (response.data) {
      setShowotp(true);
      toast.success("Otp sent successfully");
    } else {
      toast.error("Invalid email");
    }
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    resolver: zodResolver(formSchema),
  });
  const onSubmit = (data: formData) => {
    console.log(data);
  };
  return (
    <div className="h-screen ">
      <Header />
      <div className=" lg:pt-8 md:pt-16 pt-20 overflow-hidden  flex items-center  justify-around  w-full ">
        <div className=" lg:w-1/3  w-1/2 h-1/2 hidden md:block rounded-xl ">
          <img src="./signup2.png" className="rounded-2xl" alt="" />
        </div>
        <div className="bg-gray-50  px-6 py-4  flex flex-col  gap-4  rounded-2xl lg:w-1/3  w-full md:w-1/2 ">
          <div className="flex flex-col gap-1">
            <div className="text-4xl font-semibold">Welcome</div>
            <div className="text-black/70">Log in with otp</div>
          </div>
          {!showotp && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1">
                <div>
                  Email <span className="text-red-600 ">*</span>
                </div>
                <input
                  {...register("email")}
                  type="text"
                  className="px-2 py-2 border-gray-300 border-1  rounded-xl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-600">{errors.email.message}</p>
                )}
              </div>

              {!showotp && (
                <div>
                  <button
                    className="w-full bg-black mt-3  px-2 py-2  text-white  cursor-pointer rounded-xl"
                    onClick={SignOtp}
                  >
                    {loading ? (
                      <div className="flex justify-center">
                        <img src="./1488.gif" className="h-6 w-6 text-center" />
                      </div>
                    ) : (
                      "Send otp"
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
          {showotp && (
            <div className="w-full">
              <div>
                otp <span className="text-red-600 ">*</span>
              </div>
              <input
                type="text"
                className="px-2 w-full py-2 border-gray-300 border-1 rounded-xl"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
                placeholder="Enter otp"
              />
              <div>
                <button
                  className="w-full bg-black mt-3  px-2 py-2  text-white  cursor-pointer rounded-xl"
                  onClick={verifyOtp}
                >
                  {loading ? (
                    <div className="flex justify-center">
                      <img src="./1488.gif" className="h-6 w-6 text-center" />
                    </div>
                  ) : (
                    "Verify otp"
                  )}
                </button>
              </div>
            </div>
          )}
          <div>
            Already have a account?{" "}
            <span className="text-blue-600">Signup</span>
          </div>

          <ToastContainer
            position="top-center"
            autoClose={1900}
            hideProgressBar
            newestOnTop={false}
            closeOnClick={false}
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
