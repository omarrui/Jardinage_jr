// This file handles all communication with the backend API

import { apiUrl } from "./apiConfig";

// CUSTOMER SIGNUP
export async function signupCustomer(data) {
  const response = await fetch(apiUrl("/api/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// CUSTOMER LOGIN
export async function loginCustomer(data) {
  const response = await fetch(apiUrl("/api/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ADMIN LOGIN
export async function adminLogin(data) {
  const response = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// BOOKIN ui
export async function createAppointment(data) {
    const response = await fetch(apiUrl("/api/appointments"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    return response.json();
  }
