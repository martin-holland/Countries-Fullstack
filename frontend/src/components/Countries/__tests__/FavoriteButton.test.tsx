import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { favoritesApi } from "../../../api/services/favorites";
import { useAuth } from "../../../context/AuthContext";
import { Country } from "../../../types/country";
import { CountryFavorite } from "../../../types/favorite";
import { FavoriteButton } from "../FavoriteButton";

// Define the type for the auth context value
interface AuthContextValue {
  user: { id: string } | null;
}

// Define the type for the mocked useAuth function
type MockedUseAuth = ReturnType<typeof vi.fn> & {
  mockReturnValue: (value: AuthContextValue) => void;
};

// Define the type for the mocked API functions
interface ApiResponses {
  addFavorite: CountryFavorite;
  isFavorite: boolean;
}

type MockedApiFunction<T extends keyof ApiResponses> = ReturnType<
  typeof vi.fn
> & {
  mockResolvedValue: (value: ApiResponses[T]) => void;
};

// Mock the useAuth hook
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock the favoritesApi
vi.mock("../../../api/services/favorites", () => {
  return {
    favoritesApi: {
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue([]),
      isFavorite: vi.fn().mockResolvedValue(false),
    },
  };
});

describe("FavoriteButton Component", () => {
  const mockCountry: Country = {
    name: {
      common: "Finland",
      official: "Republic of Finland",
    },
    capital: ["Helsinki"],
    region: "Europe",
    subregion: "Northern Europe",
    population: 5530719,
    flags: {
      png: "https://flagcdn.com/w320/fi.png",
      svg: "https://flagcdn.com/fi.svg",
      alt: "The flag of Finland",
    },
    cca3: "FIN",
    currencies: {
      EUR: {
        name: "Euro",
        symbol: "€",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the useAuth hook to return a logged in user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: { id: "user123" },
    });
  });

  test("renders favorite button when user is logged in", async () => {
    render(<FavoriteButton country={mockCountry} />);

    // Check if the favorite button is rendered
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("adds country to favorites when clicked", async () => {
    const user = userEvent.setup();

    // Mock the addFavorite function to return success
    (
      favoritesApi.addFavorite as MockedApiFunction<"addFavorite">
    ).mockResolvedValue({
      id: "fav123",
      country_code: "FIN",
      country_name: "Finland",
      country_flag: "https://flagcdn.com/w320/fi.png",
      created_at: new Date().toISOString(),
      user_id: "user123",
    });

    render(<FavoriteButton country={mockCountry} />);

    // Click the favorite button
    await user.click(screen.getByRole("button"));

    // Check if addFavorite was called with the correct parameters
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(mockCountry);
  });

  test("removes country from favorites when already favorited", async () => {
    const user = userEvent.setup();

    // Mock the isFavorite function to return true
    (
      favoritesApi.isFavorite as MockedApiFunction<"isFavorite">
    ).mockResolvedValue(true);

    render(<FavoriteButton country={mockCountry} />);

    // Click the favorite button
    await user.click(screen.getByRole("button"));

    // Check if removeFavorite was called with the correct parameters
    expect(favoritesApi.removeFavorite).toHaveBeenCalledWith("Finland");
  });

  test("does not render when user is not logged in", () => {
    // Mock the useAuth hook to return no user
    (useAuth as MockedUseAuth).mockReturnValue({
      user: null,
    });

    render(<FavoriteButton country={mockCountry} />);

    // Check if the favorite button is not rendered
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
