import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, CropFormData } from '@/types';
import { getCrops, createCrop, deleteCrop } from '@/services/cropService';

const cropSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  area: z.coerce.number().positive('Area must be a positive number').optional().or(z.literal('')),
  amount: z.coerce.number().int('Amount must be an integer').positive().optional().or(z.literal('')),
  started_date: z.string().optional(),
});

const SettingsPage = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
  });

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        const data = await getCrops();
        setCrops(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleAddCrop = async (data: CropFormData) => {
    try {
      // Clean up empty string values from optional number fields
      const cleanedData = {
        ...data,
        area: data.area || null,
        amount: data.amount || null,
        started_date: data.started_date || null,
      };
      const newCrop = await createCrop(cleanedData);
      setCrops([newCrop, ...crops]);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await deleteCrop(id);
        setCrops(crops.filter((crop) => crop.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Settings - Manage Crops/Plots</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(handleAddCrop)}>
        <h2>Add New Crop</h2>
        <div>
          <label>Name:</label>
          <input {...register('name')} />
          {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
        </div>
        <div>
          <label>Location:</label>
          <input {...register('location')} />
        </div>
        <div>
          <label>Area (m²):</label>
          <input type="number" {...register('area')} />
          {errors.area && <p style={{ color: 'red' }}>{errors.area.message}</p>}
        </div>
        <div>
          <label>Amount (e.g., number of trees):</label>
          <input type="number" {...register('amount')} />
          {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
        </div>
        <div>
          <label>Started Date:</label>
          <input type="date" {...register('started_date')} />
        </div>
        <button type="submit">Add Crop</button>
      </form>

      <hr />

      <h2>Existing Crops</h2>
      <ul>
        {crops.map((crop) => (
          <li key={crop.id}>
            <strong>{crop.name}</strong> - {crop.location}
            <p>Area: {crop.area} m², Amount: {crop.amount}, Started: {crop.started_date}</p>
            <button onClick={() => handleDeleteCrop(crop.id)}>Delete</button>
            {/* Edit button to be implemented */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettingsPage;
