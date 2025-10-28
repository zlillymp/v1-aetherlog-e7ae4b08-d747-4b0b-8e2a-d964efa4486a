import React from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, PlayCircle, Phone } from 'lucide-react';
import { Contact } from "../../shared/types";
import { useSelectedContactCalls } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
interface CallHistoryProps {
  contact: Contact;
}
export function CallHistory({ contact }: CallHistoryProps) {
  const calls = useSelectedContactCalls();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Call History for {contact.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Direction</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.length > 0 ?
              calls.map((call) =>
              <TableRow key={call.id}>
                    <TableCell>
                      {call.direction === 'inbound' ?
                  <Badge variant="outline" className="text-green-600 border-green-600/50">
                          <ArrowDownLeft className="mr-2 h-4 w-4" />
                          Inbound
                        </Badge> :

                  <Badge variant="outline" className="text-blue-600 border-blue-600/50">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Outbound
                        </Badge>
                  }
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{format(new Date(call.timestamp), 'PPP')}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(call.timestamp), 'p')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" disabled>
                        <PlayCircle className="h-5 w-5" />
                        <span className="sr-only">Play recording</span>
                      </Button>
                    </TableCell>
                  </TableRow>
              ) :

              <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Phone className="h-8 w-8 mb-2" />
                        <span>No call records found for {contact.name}.</span>
                    </div>
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>);

}