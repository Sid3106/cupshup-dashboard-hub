import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActivityTableProps } from "@/types/activities";

export const MyActivitiesTable = ({ activities, onRowClick }: ActivityTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Assigned On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow 
            key={activity.id}
            className="cursor-pointer hover:bg-muted"
            onClick={() => onRowClick(activity.activities.id)}
          >
            <TableCell>{activity.activities.brand}</TableCell>
            <TableCell>{activity.activities.city}</TableCell>
            <TableCell>{activity.activities.location}</TableCell>
            <TableCell>
              {format(new Date(activity.activities.start_date), 'PPP')}
            </TableCell>
            <TableCell>{activity.creator_name}</TableCell>
            <TableCell>
              {format(new Date(activity.created_at), 'PPP')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};