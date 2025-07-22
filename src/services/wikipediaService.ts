// Service for fetching historical figure images from Wikipedia
export interface WikipediaImageData {
    imageUrl: string;
    description: string;
    attribution: string;
  }
  
  export async function fetchWikipediaImage(characterName: string): Promise<WikipediaImageData | null> {
    try {
      // Step 1: Search for the Wikipedia page
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(characterName)}`
      );
  
      if (!searchResponse.ok) {
        console.error(`Wikipedia search failed for ${characterName}:`, searchResponse.status);
        return null;
      }
  
      const searchData = await searchResponse.json();
      
      // Check if we have a thumbnail image from the summary
      if (searchData.thumbnail && searchData.thumbnail.source) {
        return {
          imageUrl: searchData.thumbnail.source.replace(/\/\d+px-/, '/400px-'), // Get higher resolution
          description: searchData.description || `Portrait of ${characterName}`,
          attribution: `Image from Wikipedia - ${searchData.content_urls?.desktop?.page || 'wikipedia.org'}`
        };
      }
  
      // Step 2: If no thumbnail, try to get the main image from the page
      const pageTitle = searchData.title || characterName;
      const imagesResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(pageTitle)}`
      );
  
      if (!imagesResponse.ok) {
        console.error(`Wikipedia images fetch failed for ${pageTitle}:`, imagesResponse.status);
        return null;
      }
  
      const imagesData = await imagesResponse.json();
      
      // Look for the first suitable image (usually a portrait)
      const suitableImage = imagesData.items?.find((item: any) => {
        const title = item.title?.toLowerCase() || '';
        const isImage = title.includes('.jpg') || title.includes('.png') || title.includes('.jpeg');
        const isPortrait = title.includes('portrait') || title.includes(characterName.toLowerCase().split(' ')[0]);
        const notFlag = !title.includes('flag') && !title.includes('coat');
        const notMap = !title.includes('map') && !title.includes('location');
        return isImage && notFlag && notMap && (isPortrait || imagesData.items.indexOf(item) === 0);
      });
  
      if (suitableImage) {
        // Get the actual image URL
        const imageTitle = suitableImage.title;
        const imageInfoResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/media/${encodeURIComponent(imageTitle)}`
        );
  
        if (imageInfoResponse.ok) {
          const imageInfo = await imageInfoResponse.json();
          const imageUrl = imageInfo.original?.source;
          
          if (imageUrl) {
            return {
              imageUrl: imageUrl,
              description: imageInfo.description || `Portrait of ${characterName}`,
              attribution: `Image from Wikipedia Commons`
            };
          }
        }
      }
  
      return null;
    } catch (error) {
      console.error(`Error fetching Wikipedia image for ${characterName}:`, error);
      return null;
    }
  }
  
  // Fallback images for common historical figures (public domain)
  export const fallbackImages: Record<string, WikipediaImageData> = {
    "Lorenzo de' Medici": {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lorenzo_de%27_Medici-ritratto.jpg/400px-Lorenzo_de%27_Medici-ritratto.jpg",
      description: "Portrait of Lorenzo de' Medici",
      attribution: "Image from Wikipedia Commons"
    },
    "Napoleon Bonaparte": {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/400px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg",
      description: "Portrait of Napoleon Bonaparte",
      attribution: "Image from Wikipedia Commons"
    },
    "Leonardo da Vinci": {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/400px-Leonardo_self.jpg",
      description: "Self-portrait of Leonardo da Vinci",
      attribution: "Image from Wikipedia Commons"
    },
    "Cleopatra VII": {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cleopatra_VII_tetradrachm_Syria_mint.jpg/400px-Cleopatra_VII_tetradrachm_Syria_mint.jpg",
      description: "Ancient coin depicting Cleopatra VII",
      attribution: "Image from Wikipedia Commons"
    },
    "Albert Einstein": {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/400px-Albert_Einstein_Head.jpg",
      description: "Portrait of Albert Einstein",
      attribution: "Image from Wikipedia Commons"
    }
  };
  
  export async function getCharacterImage(characterName: string): Promise<WikipediaImageData> {
    // First try to fetch from Wikipedia API
    const wikipediaImage = await fetchWikipediaImage(characterName);
    
    if (wikipediaImage) {
      return wikipediaImage;
    }
  
    // Check fallback images
    const fallbackImage = fallbackImages[characterName];
    if (fallbackImage) {
      return fallbackImage;
    }
  
    // Final fallback - return the default Lorenzo image
    return fallbackImages["Lorenzo de' Medici"];
  }