import React from 'react';

import Cookies from 'js-cookie';
import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createUser, loginUser } from '../hook/AuthUser';
import Login from '../pages/Login';
import Register from '../pages/Register';
import HomePage from '../pages/app';

const token = Cookies.get('token');

async function registerAction({ request }) {
  const formData = await request.formData();
  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');
  const res = await createUser({ username, email, password });
  if (!res.success) {
    return res.error;
  }

  if (res.status === false) {
    return res.message;
  }
  toast.success('Register Success');
  return redirect('/login');
}

async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const res = await loginUser({ email, password });
  if (!res.success) {
    toast.error(res.error.msg);
    return res.error.msg;
  }
  return redirect('/');
}

const modules = import.meta.glob('/src/pages/**/[a-z[]*.jsx', { eager: true });

const pages = Object.keys(modules)
  .map((mod) => {
    if (!mod.includes('app')) {
      const path = mod
        .replace(/\/src\/pages|app|index|\.jsx$/g, '')
        .replace(/\[\.{3}.+\]/, '*')
        .replace(/\[(.+)\]/, ':$1');

      const Element = modules[mod].default;
      return {
        path,
        element: <Element />,
      };
    }
    return false;
  })
  .filter((page) => !!page);

const routes = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    children: [...pages],
  },
  {
    path: 'login',
    element: token ? <Navigate to="/" /> : <Login />,
    action: loginAction,
  },
  {
    path: 'register',
    element: token ? <Navigate to="/" /> : <Register />,
    action: registerAction,
  },
  {
    path: 'protected',
    element: token ? <div>Protected Layout</div> : <Navigate to="/login" />,
  },
]);

export default routes;
