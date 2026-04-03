CREATE OR REPLACE FUNCTION public.handle_order_cancellation()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.order_assigned_cooks
    SET cook_status = 'rejected'
    WHERE order_id = NEW.id
      AND cook_status NOT IN ('rejected');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_order_cancelled
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION public.handle_order_cancellation();