'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/nityodin/star-rating';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewForm({
  productId,
  productName,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Review submitted! Thank you for your feedback.');
        setRating(0);
        setComment('');
        onSubmit?.();
      } else {
        toast.error(data.message || data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Write a Review — {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star selector */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Your rating</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <p className="text-xs text-muted-foreground">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Your review (optional)
          </p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={500}
            className="min-h-[80px] resize-none text-sm"
          />
          <p className="text-right text-xs text-muted-foreground">
            {comment.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="gap-1.5"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}