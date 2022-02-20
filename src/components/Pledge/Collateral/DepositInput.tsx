import {
  FormControl,
  FormErrorMessage,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik';
import { useCallback, useState } from 'react';
import { YAMATO_SYMBOL } from '../../../constants/yamato';
import { useActiveWeb3React } from '../../../hooks/web3';
import { useDepositCallback } from '../../../hooks/yamato/useDepositCallback';
import { useWalletState } from '../../../state/wallet/hooks';
import { addToNum } from '../../../utils/bignumber';
import { errorToast } from '../../../utils/errorToast';
import {
  formatCollateralizationRatio,
  formatPrice,
} from '../../../utils/prices';
import { CustomButton, CustomFormLabel, CustomInput } from '../../CommonItem';

type Props = { collateral: number; debt: number; rateOfEthJpy: number };

export default function DepositInput(props: Props) {
  const { collateral, debt, rateOfEthJpy } = props;

  const { account } = useActiveWeb3React();
  const { callback } = useDepositCallback();
  const { eth } = useWalletState();

  const [deposit, setDeposit] = useState<number | string>();

  const validateDeposit = useCallback(
    async (value: number | string) => {
      if (!account || !callback) {
        return `ウォレットを接続してください。またはネットワークを切り替えてください。`;
      }

      if (value !== '' && typeof value !== 'number') {
        return '数値で入力してください。';
      }
      if (value > eth) {
        return '残高を超えています。';
      }

      // Value is correct
      setDeposit(value);
      return undefined;
    },
    [account, eth, callback]
  );

  const submitDeposit = useCallback(
    async (
      values: { deposit: string },
      formikHelpers: FormikHelpers<{
        deposit: string;
      }>
    ) => {
      console.debug('submit deposit', values);

      if (typeof values.deposit === 'number') {
        if (values.deposit <= 0) {
          errorToast('預入量が0です。');
          return;
        }
  
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const res = await callback!(values.deposit);
          console.debug('deposit done', res);
        } catch (error) {
          errorToast(error);
        }
      }

      // reset
      setDeposit('');
      formikHelpers.resetForm();
    },
    [callback]
  );

  return (
    <Formik initialValues={{ deposit: '' }} onSubmit={submitDeposit}>
      {(formikProps) => (
        <Form>
          <VStack spacing={4} align="start">
            <HStack
              spacing={4}
              align={
                formikProps.errors.deposit && formikProps.touched.deposit
                  ? 'center'
                  : 'end'
              }
            >
              <Field name="deposit" validate={validateDeposit}>
                {({ field }: FieldProps) => (
                  <FormControl
                    isInvalid={!!formikProps.errors.deposit}
                    style={{ maxWidth: '200px' }}
                  >
                    <CustomFormLabel htmlFor="deposit" text="預入量入力" />
                    <CustomInput
                      {...field}
                      id="deposit"
                      type="number"
                      placeholder={YAMATO_SYMBOL.COLLATERAL}
                      data-testid="collateral-data-depositAmount"
                    />
                    <FormErrorMessage>
                      {formikProps.errors.deposit}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <CustomButton
                isLoading={formikProps.isSubmitting}
                type="submit"
                data-testid="collateral-act-deposit"
                isDisabled={typeof deposit !== 'number'}
              >
                預入実行
              </CustomButton>
            </HStack>
            {typeof deposit === 'number' && deposit > 0 && (
              <VStack spacing={4} align="start">
                <CustomFormLabel
                  text={`変動予測値 ${
                    formatPrice(addToNum(collateral, deposit), 'jpy').value
                  } ${YAMATO_SYMBOL.COLLATERAL}`}
                />
                <CustomFormLabel
                  text={`担保率 ${formatCollateralizationRatio(
                    (collateral + deposit) * rateOfEthJpy,
                    debt
                  )}%`}
                />
              </VStack>
            )}
          </VStack>
        </Form>
      )}
    </Formik>
  );
}
