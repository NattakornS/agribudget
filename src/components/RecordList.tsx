import React from 'react';
import { Card } from '@/components/ui/card';

interface RecordListProps {
  records: any[];
  onRecordClick: (record: any) => void;
  renderItem: (record: any) => React.ReactNode;
}

const RecordList: React.FC<RecordListProps> = ({ records, onRecordClick, renderItem }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card
          key={record.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20"
          onClick={() => onRecordClick(record)}
        >
          <div className="p-4">
            {renderItem(record)}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RecordList;
