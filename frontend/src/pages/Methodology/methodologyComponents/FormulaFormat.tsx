import React from 'react'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

type RightSideItem = string | FractionProps

interface FractionProps {
  numerator?: string
  denominator?: string
}

const FractionFormat: React.FC<FractionProps> = ({
  numerator,
  denominator,
}) => (
  <div className={styles.Fraction}>
    {numerator ? (
      <div className={styles.WrappedInParentheses}>
        <div className={styles.Numerator}>{numerator}</div>
        <div className={styles.Denominator}>{denominator}</div>
      </div>
    ) : (
      <div className={styles.WrappedInParentheses}>
        <div className={styles.Denominator}>{denominator}</div>
      </div>
    )}
  </div>
)

interface FormulaProps {
  leftSide?: string
  rightSide: RightSideItem[]
}

const FormulaFormat: React.FC<FormulaProps> = ({ leftSide, rightSide }) => (
  <div className={styles.FormulaFormat}>
    <code className={styles.FormulaFormatCode}>
      <b>{leftSide}</b>
      <div>{' = '}</div>

      {rightSide.map((item, index) => (
        <div key={index}>
          {typeof item === 'string' ? (
            item
          ) : (
            <FractionFormat
              numerator={item.numerator}
              denominator={item.denominator}
            />
          )}
        </div>
      ))}
    </code>
  </div>
)

export default FormulaFormat
