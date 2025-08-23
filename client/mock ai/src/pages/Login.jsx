import React from "react";
import { GOOGLE_LOGIN_URL } from "../api/auth";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="p-10 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Sign in to Mock Interview</h1>
        <a
          href={GOOGLE_LOGIN_URL}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign in with Google
        </a>
      </div>
    </div>
  );
};

export default Login;
