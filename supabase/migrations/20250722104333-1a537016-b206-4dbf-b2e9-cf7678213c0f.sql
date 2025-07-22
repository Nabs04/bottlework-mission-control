-- Update the handle_new_user function to include all profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    role,
    phone_number,
    address,
    date_of_birth,
    bank_account_number,
    availability
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'employee'),
    NULLIF(NEW.raw_user_meta_data ->> 'phone_number', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'date_of_birth', '')::date,
    NULLIF(NEW.raw_user_meta_data ->> 'bank_account_number', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'availability')::availability, 'flexible')
  );
  RETURN NEW;
END;
$$;