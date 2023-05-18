import React from 'react';
import {
  Input,
  Field as FluentField,
  Textarea,
} from '@fluentui/react-components';

export default function Field(
  props: React.PropsWithChildren<{
    title: string;
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    type?: 'input' | 'textarea';
    disabled?: boolean;
    inputType?: 'number' | 'text';
  }>
) {
  const inputProps = {
    id: props.name,
    name: props.name,
    value: props.value ?? '',
    disabled: props.disabled ?? false,
    type: props.inputType ?? 'text',
    onChange: (_: any, data: { value?: string }) =>
      props.onChange?.(data?.value ?? ''),
  };
  const Element = props.type === 'textarea' ? Textarea : Input;

  return (
    <FluentField label={props.title}>
      <Element {...inputProps} />
    </FluentField>
  );
}
