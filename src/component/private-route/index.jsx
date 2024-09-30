import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const PrivateRoute = ({ requiredRole = null }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    console.log("Raw user string from localStorage:", userString);
    
    let user;
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }  
    // console.log("Token:", token);
    // console.log("Parsed user object:", user);
    // console.log("User Type:", user.userType);
    // console.log("Required Role:", requiredRole);
  
    if (!token) {
      navigate("/login");
    } else if (requiredRole && user?.userType !== requiredRole) {
      console.log("User role doesn't match. Redirecting to home.");
      navigate("/");
    } else {
      console.log("User authorized");
      setIsAuthorized(true);
    }
  }, [navigate, requiredRole]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return <Outlet />;
};

export default PrivateRoute;