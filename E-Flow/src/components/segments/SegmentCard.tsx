import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { Segment } from "@/types";
import { cn } from "@/lib/utils";

interface SegmentCardProps {
  segment: Segment;
  rank: number;
  isActive: boolean;
  onClick: () => void;
}

export function SegmentCard({ segment, rank, isActive, onClick }: SegmentCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isActive && "ring-2 ring-primary border-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            rank === 1 && "bg-primary text-primary-foreground",
            rank === 2 && "bg-accent text-accent-foreground",
            rank >= 3 && "bg-muted text-muted-foreground"
          )}>
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{segment.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {segment.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {segment.size} contacts
              </Badge>
              {segment.conversionRate && (
                <Badge variant="outline" className="text-xs text-success border-success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {segment.conversionRate}% conversion
                </Badge>
              )}
            </div>
            
            {/* Trait pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {segment.traits.industries?.slice(0, 2).map(industry => (
                <Badge key={industry} variant="outline" className="text-xs">
                  <Briefcase className="w-2.5 h-2.5 mr-1" />
                  {industry}
                </Badge>
              ))}
              {segment.traits.locations?.slice(0, 1).map(location => (
                <Badge key={location} variant="outline" className="text-xs">
                  <MapPin className="w-2.5 h-2.5 mr-1" />
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
