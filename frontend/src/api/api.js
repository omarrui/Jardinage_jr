// This file handles all communication with the backend API

const API_URL = "http://127.0.0.1:5000";

export async function signupCustomer(data) {
  return fetch(`${API_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
}
