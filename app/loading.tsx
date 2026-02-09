'use client';

import { Center } from '@mantine/core';
import Loader from '@/components/common/Loader';

export default function Loading() {
  return (
    <Center h="50vh">
      <Loader size={48} />
    </Center>
  );
}
