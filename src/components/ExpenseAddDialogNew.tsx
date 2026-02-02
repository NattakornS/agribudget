import type { Crop, ExpenseFormData } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import EditModal from '@/components/EditModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';

interface ExpenseAddDialogNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  title: string;
  crops: Crop[];
  register: UseFormRegister<ExpenseFormData>;
  watch: UseFormWatch<ExpenseFormData>;
  setValue: UseFormSetValue<ExpenseFormData>;
  errors: FieldErrors<ExpenseFormData>;
  isManualTotal: boolean;
  setIsManualTotal: (value: boolean) => void;
  showDelete?: boolean;
}

const ExpenseAddDialogNew = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  title,
  crops,
  register,
  watch,
  setValue,
  errors,
  isManualTotal,
  setIsManualTotal,
  showDelete = true,
}: ExpenseAddDialogNewProps) => {
  const { t } = useLanguage();

  const watchedCost = watch('cost');
  const watchedAmount = watch('amount');

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      title={title}
      showDelete={showDelete}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('selectCrop')} *</label>
          <Select value={watch('crop_id')} onValueChange={(value) => setValue('crop_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectCrop')} />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.crop_id && (
            <p className="text-sm text-destructive mt-1">{errors.crop_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t('cost')} *</label>
            <Input
              type="number"
              step="0.01"
              placeholder={t('enterUnitCost')}
              {...register('cost', { valueAsNumber: true })}
            />
            {errors.cost && (
              <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">{t('amount')} *</label>
            <Input
              type="number"
              step="0.01"
              placeholder={t('enterAmount')}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t('unitOptional')}</label>
          <Input
            type="text"
            placeholder={t('enterUnit')}
            {...register('unit')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">{t('total')} *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {!isManualTotal && watchedCost && watchedAmount 
                  ? `${t('auto')}: ${watchedCost} × ${watchedAmount} = ${(watchedCost * watchedAmount).toFixed(2)}`
                  : t('manualEntry')}
              </span>
              {isManualTotal && watchedCost && watchedAmount && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualTotal(false);
                    setValue('total', watchedCost * watchedAmount);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  {t('resetToAuto')}
                </button>
              )}
            </div>
          </div>
          <Input
            type="number"
            step="0.01"
            placeholder={t('enterTotal')}
            {...register('total', { 
              valueAsNumber: true,
              onChange: () => setIsManualTotal(true)
            })}
          />
          {errors.total && (
            <p className="text-sm text-destructive mt-1">{errors.total.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">{t('date')} *</label>
          <Input
            type="date"
            {...register('expense_date')}
          />
          {errors.expense_date && (
            <p className="text-sm text-destructive mt-1">{errors.expense_date.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">{t('category')} *</label>
          <Input
            type="text"
            placeholder={t('enterCategory')}
            {...register('category_name')}
          />
          {errors.category_name && (
            <p className="text-sm text-destructive mt-1">{errors.category_name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">{t('detailsOptional')}</label>
          <Textarea
            placeholder={t('addDetails')}
            {...register('detail')}
            rows={3}
          />
          {errors.detail && (
            <p className="text-sm text-destructive mt-1">{errors.detail.message}</p>
          )}
        </div>
      </div>
    </EditModal>
  );
};

export default ExpenseAddDialogNew;
