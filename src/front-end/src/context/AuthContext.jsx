import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { Spin } from 'antd';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const initialState = {
  currentUser: null,
  loading: true, 
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { currentUser: action.payload, loading: false };
    case 'AUTH_FAILURE':
      return { currentUser: null, loading: false };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state, // Giữ lại các state khác như 'loading'
        currentUser: action.payload, // Ghi đè currentUser bằng dữ liệu mới
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await apiClient.get('/user/info');
        dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.log("No active user session found.");
        } else {
          console.error("An error occurred while checking user status:", err);
        }
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };
    
    checkUserStatus();
  }, []);

  if (state.loading) {
    return <Spin spinning={true} fullscreen tip="Đang tải dữ liệu người dùng..." />;
  }

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;