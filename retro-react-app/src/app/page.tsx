import { Container, Box, Divider } from "@mui/material";
import { HeroSection } from "@/components/hero-section";
import { FeaturedGames } from "@/components/featured-games";

export default function Home(): React.JSX.Element {
  return (
    <Box>
      {/* Hero Section */}
      <HeroSection />

      {/* Content Divider */}
      <Divider
        sx={{
          mb: 6,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      />

      {/* Featured Games Section */}
      <Container maxWidth="lg">
        <FeaturedGames />
      </Container>
    </Box>
  );
}
