import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Collection } from '@/lib/supabase'

interface CollectionCardProps {
  collection: Collection
  onViewProducts: (collectionId: string) => void
}

export const CollectionCard = ({ collection, onViewProducts }: CollectionCardProps) => {
  return (
    <Card className="bg-white border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="aspect-[4/3] bg-gradient-to-br from-pink-50 to-orange-50 overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {collection.image ? (
            <img 
              src={collection.image} 
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-black font-semibold text-lg line-clamp-1">
              {collection.name}
            </h3>
            {collection.featured && (
              <span className="bg-gradient-to-r from-accent to-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                ⭐ Destacado
              </span>
            )}
          </div>
          
          {collection.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {collection.description}
            </p>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md group-hover:shadow-lg"
            onClick={() => onViewProducts(collection.id)}
          >
            Ver Productos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}