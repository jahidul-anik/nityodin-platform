'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { usePlatformStore } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format price from paisa to ৳ BDT string. */
function formatPrice(paisa: number): string {
  const taka = paisa / 100;
  return `৳ ${taka.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CartDrawer() {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = usePlatformStore();
  const [open, setOpen] = useState(false);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const serviceFee = Math.round(subtotal * 0.02);
  const total = subtotal + serviceFee;

  const isEmpty = cart.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-accent transition-colors" aria-label="Open cart">
          <ShoppingCart className="size-5 text-muted-foreground" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5" />
                <span>Shopping Cart</span>
                {cartCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">({cartCount} items)</span>
                )}
              </SheetTitle>
              <SheetDescription className="mt-1">Review your items before checkout</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add items to get started</p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items list */}
            <ScrollArea className="flex-1 max-h-[60vh]">
              <div className="flex flex-col px-6 py-4 gap-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors"
                  >
                    {/* Product image or placeholder */}
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-full object-cover rounded-md"
                        />
                      ) : (
                        <ShoppingBag className="size-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                      {item.unit && (
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      )}
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity - 1)
                          }
                          className="flex size-7 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity + 1)
                          }
                          className="flex size-7 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Summary + actions */}
            <SheetFooter className="flex flex-col gap-4 px-6 py-4">
              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Fee (2%)</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Checkout with Wallet
              </Button>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;