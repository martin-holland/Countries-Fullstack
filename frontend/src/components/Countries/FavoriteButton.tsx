import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { favoritesApi } from "../../api/services/favorites";
import { useAuth } from "../../context/AuthContext";
import { Country } from "../../types/country";

interface FavoriteButtonProps {
  country: Country;
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({ country, onToggle }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only check favorite status if user is logged in and component is mounted
    if (!user || isInitialized) return;

    const checkFavoriteStatus = async () => {
      try {
        const status = await favoritesApi.isFavorite(country.name.common);
        setIsFavorite(status);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [country.name.common, user, isInitialized]);

  const handleToggleFavorite = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(country.name.common);
        setIsFavorite(false);
      } else {
        await favoritesApi.addFavorite(country);
        setIsFavorite(true);
      }

      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
      <IconButton
        onClick={handleToggleFavorite}
        disabled={isLoading}
        color="primary"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};
