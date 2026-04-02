import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus } from 'lucide-react';

interface PendingCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItemCount: number;
  onContinue: () => void;
  onClearCart: () => void;
  onViewCart: () => void;
}

const PendingCartDialog: React.FC<PendingCartDialogProps> = ({
  open,
  onOpenChange,
  cartItemCount,
  onContinue,
  onClearCart,
  onViewCart,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            You have items in your cart
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have {cartItemCount} item{cartItemCount > 1 ? 's' : ''} already in your cart. 
            Would you like to complete that order, clear the cart, or add this item alongside?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onViewCart} className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart & Complete Order
          </Button>
          <Button variant="outline" onClick={onContinue} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add to Existing Cart
          </Button>
          <Button variant="destructive" onClick={onClearCart} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart & Add New Item
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PendingCartDialog;
