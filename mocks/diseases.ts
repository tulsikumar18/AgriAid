export const DISEASES = [
    {
      id: "1",
      name: "Leaf Blight",
      description: "A fungal disease that causes brown spots on leaves that eventually turn yellow and die.",
      remedy: "Apply copper-based fungicide and remove affected leaves. Ensure proper spacing between plants for air circulation.",
      prevention: "Avoid overhead watering, ensure good air circulation, and practice crop rotation.",
      confidence: 0.92,
      image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop"
    },
    {
      id: "2",
      name: "Powdery Mildew",
      description: "A fungal disease that appears as white powdery spots on leaves, stems, and sometimes fruit.",
      remedy: "Apply sulfur-based fungicide or neem oil. Remove and destroy infected plant parts.",
      prevention: "Plant resistant varieties, avoid overhead watering, and ensure good air circulation.",
      confidence: 0.88,
      image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop"
    },
    {
      id: "3",
      name: "Aphid Infestation",
      description: "Small sap-sucking insects that cause leaves to curl, yellow, and stunt growth.",
      remedy: "Spray with insecticidal soap or neem oil. Introduce beneficial insects like ladybugs.",
      prevention: "Monitor plants regularly, use reflective mulch, and plant trap crops.",
      confidence: 0.85,
      image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop"
    },
    {
      id: "4",
      name: "Root Rot",
      description: "A fungal disease that attacks the roots, causing them to decay and the plant to wilt.",
      remedy: "Improve drainage, reduce watering, and apply fungicide. In severe cases, remove and destroy affected plants.",
      prevention: "Ensure good drainage, avoid overwatering, and sterilize garden tools.",
      confidence: 0.79,
      image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop"
    },
    {
      id: "5",
      name: "Mosaic Virus",
      description: "A viral disease that causes mottled patterns of yellow and green on leaves.",
      remedy: "No cure available. Remove and destroy infected plants to prevent spread.",
      prevention: "Use virus-free seeds, control insect vectors, and disinfect tools.",
      confidence: 0.82,
      image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop"
    }
  ];
  
  export type Disease = {
    id: string;
    name: string;
    description: string;
    remedy: string;
    prevention: string;
    confidence: number;
    image: string;
  };