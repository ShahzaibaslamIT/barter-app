// import { notFound } from "next/navigation";
// import { prisma } from "@barter/db";
// import EditListingClient from "./EditListingClient";

// interface PageProps {
//   params: { user_id: string };
// }

// export default async function EditListingPage({ params }: PageProps) {
//   const itemId = Number(params.user_id);

// //   if (!itemId || Number.isNaN(itemId)) {
// //     notFound();
// //   }

//   const listing = await prisma.listing.findUnique({
//     where: { item_id: itemId },
//   });

//   if (!listing) {
//     notFound();
//   }

//   return (
//     <div className="max-w-3xl mx-auto py-10">
//       <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>

//       <EditListingClient
//         listing={{
//           item_id: listing.item_id,
//           title: listing.title,
//           description: listing.description,
//           category: listing.category,
//           barter_request: listing.barter_request,
//           condition: listing.condition,
//           location_text: listing.location_text,
//           photos: listing.photos || [],
//           latitude: listing.latitude,
//           longitude: listing.longitude,
//         }}
//       />
//     </div>
//   );
// }




import { notFound } from "next/navigation";
import { prisma } from "@barter/db";
import EditListingClient from "./EditListingClient";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;   // ✅ ASYNC PARAMS (your version)
}) {
  // ✅ MUST AWAIT PARAMS IN YOUR NEXT.JS VERSION
  const { id } = await params;

  const itemId = Number(id);

  // ✅ Guard against invalid IDs
  if (!id || Number.isNaN(itemId)) {
    console.error("❌ Invalid params.id:", id);
    notFound();
  }

  // ✅ Fetch listing safely
  const listing = await prisma.listing.findUnique({
    where: { item_id: itemId },
  });

  if (!listing) {
    console.error("❌ Listing not found for id:", itemId);
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>

      <EditListingClient
        listing={{
          item_id: listing.item_id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          barter_request: listing.barter_request,
          condition: listing.condition,
          location_text: listing.location_text,
          photos: listing.photos || [],
          latitude: listing.latitude,
          longitude: listing.longitude,
        }}
      />
    </div>
  );
}
