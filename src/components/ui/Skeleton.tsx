import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse', ease: "easeInOut" }}
      className={cn('bg-clinic-surfaceHover rounded-sm', className)}
      {...props}
    />
  );
};
