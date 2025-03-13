import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAuth } from "../../context/AuthContext";
import { Navigation } from "../Navigation";

// Define the type for the auth context value
interface AuthContextValue {
  user: { email: string } | null;
  signOut: () => void;
}

// Define the type for the mocked useAuth function
type MockedUseAuth = ReturnType<typeof vi.fn> & {
  mockReturnValue: (value: AuthContextValue) => void;
};

// Mock the useAuth hook
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders navigation links when user is not logged in", () => {
    // Mock the useAuth hook to return a user who is not logged in
    (useAuth as MockedUseAuth).mockReturnValue({
      user: null,
      signOut: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Check if navigation links are rendered
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Public Data")).toBeInTheDocument();
    expect(screen.getByText("Protected Data")).toBeInTheDocument();

    // Check if login button is rendered
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check if favorites link is not rendered when user is not logged in
    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });

  test("renders navigation links when user is logged in", () => {
    const mockSignOut = vi.fn();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { email: "test@example.com" },
      signOut: mockSignOut,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Check if navigation links are rendered
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Public Data")).toBeInTheDocument();
    expect(screen.getByText("Protected Data")).toBeInTheDocument();

    // Check if favorites link is rendered when user is logged in
    expect(screen.getByText("Favorites")).toBeInTheDocument();

    // Check if logout button is rendered with user email
    expect(screen.getByText("Logout (test@example.com)")).toBeInTheDocument();
  });

  test("calls signOut when logout button is clicked", () => {
    const mockSignOut = vi.fn();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { email: "test@example.com" },
      signOut: mockSignOut,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Click the logout button
    screen.getByText("Logout (test@example.com)").click();

    // Check if signOut function was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
