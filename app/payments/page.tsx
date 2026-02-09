'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Select,
  Modal,
  NumberInput,
  SimpleGrid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconPlus, IconSend, IconCash } from '@tabler/icons-react';
import { PaymentStatusBadge } from '@/components/common/StatusBadge';
import { formatShortDate, formatCurrency } from '@/lib/format';
import type { Student, PaymentStatus } from '@/types';

interface PaymentRow {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  payment_method: string | null;
  paid_date: string | null;
  razorpay_link_url: string | null;
  notes: string | null;
  students: { id: string; name: string; email: string; phone: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [sendingLink, setSendingLink] = useState<string | null>(null);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: 0,
    due_date: null as Date | null,
    notes: '',
  });

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (statusFilter) {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/payments?${params.toString()}`);
      const data = await response.json();
      if (data.ok) {
        setPayments(data.data.rows);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students?active=true&limit=1000');
      const data = await response.json();
      if (data.ok) {
        setStudents(data.data.rows);
      }
    } catch {
      // Error handled silently
    }
  };

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    loadStudents();
  }, []);

  const handleCreatePayment = async () => {
    if (!formData.student_id || !formData.amount || !formData.due_date) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: formData.student_id,
          amount: formData.amount,
          due_date: formData.due_date.toISOString().split('T')[0],
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Payment created',
          color: 'green',
        });
        closeAddModal();
        setFormData({ student_id: '', amount: 0, due_date: null, notes: '' });
        loadPayments();
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to create payment',
        color: 'red',
      });
    }
  };

  const handleSendLink = async (paymentId: string) => {
    setSendingLink(paymentId);
    try {
      const response = await fetch(`/api/payments/${paymentId}/send-link`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Payment link sent to student',
          color: 'green',
        });
        loadPayments();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send payment link',
        color: 'red',
      });
    } finally {
      setSendingLink(null);
    }
  };

  const handleMarkPaid = async (paymentId: string, method: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          payment_method: method,
          paid_date: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Payment marked as paid',
          color: 'green',
        });
        loadPayments();
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update payment',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Payments</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Payment
        </Button>
      </Group>

      <Group mb="lg" grow>
        <TextInput
          placeholder="Search by student name..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
        />
      </Group>

      {loading ? (
        <Text c="dimmed" ta="center" py="xl">
          Loading payments...
        </Text>
      ) : payments.length === 0 ? (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <Text fw={500}>No payments found</Text>
            <Text c="dimmed" size="sm">
              Create a payment to get started
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {payments.map(payment => (
            <Card key={payment.id} withBorder padding="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="md" mb="xs">
                    <Text fw={500} size="lg">
                      {payment.students.name}
                    </Text>
                    <PaymentStatusBadge status={payment.status} />
                  </Group>
                  <Group gap="xl" c="dimmed">
                    <Text size="sm">
                      Amount: {formatCurrency(payment.amount)}
                    </Text>
                    <Text size="sm">
                      Due: {formatShortDate(payment.due_date)}
                    </Text>
                    {payment.paid_date && (
                      <Text size="sm">
                        Paid: {formatShortDate(payment.paid_date)}
                      </Text>
                    )}
                  </Group>
                  {payment.notes && (
                    <Text size="sm" c="dimmed" mt="xs">
                      {payment.notes}
                    </Text>
                  )}
                </div>

                {payment.status === 'pending' && (
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconSend size={14} />}
                      onClick={() => handleSendLink(payment.id)}
                      loading={sendingLink === payment.id}
                    >
                      Send Link
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconCash size={14} />}
                      onClick={() => handleMarkPaid(payment.id, 'cash')}
                    >
                      Cash
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="violet"
                      onClick={() => handleMarkPaid(payment.id, 'upi')}
                    >
                      UPI
                    </Button>
                  </Group>
                )}
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Create Payment"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Student"
            placeholder="Select a student"
            data={students.map(s => ({ value: s.id, label: s.name }))}
            value={formData.student_id}
            onChange={value =>
              setFormData(prev => ({ ...prev, student_id: value || '' }))
            }
            searchable
            required
          />
          <NumberInput
            label="Amount (INR)"
            placeholder="Enter amount"
            min={1}
            value={formData.amount}
            onChange={value =>
              setFormData(prev => ({
                ...prev,
                amount: typeof value === 'number' ? value : 0,
              }))
            }
            required
          />
          <DateInput
            label="Due Date"
            placeholder="Select due date"
            value={formData.due_date}
            onChange={value =>
              setFormData(prev => ({
                ...prev,
                due_date: value ? new Date(value) : null,
              }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Payment notes"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayment}>Create Payment</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
