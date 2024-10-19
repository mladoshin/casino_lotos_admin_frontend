import { CheckCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useState } from "react";

interface CopyableTextProps {
  children: string;
  style?: React.CSSProperties;
  className?: string;
}

const CopyableText = ({
  children,
  style,
  className = "",
}: CopyableTextProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  function planResetIsCopied() {
    setTimeout(() => setIsCopied(false), 2000);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      planResetIsCopied()
    } catch (err) {
      console.error("Ошибка копирования текста: ", err);
    }
  }

  return (
    <div>
      <span style={style} className={className}>
        {children}
      </span>
      <Button icon={!isCopied ? <CopyOutlined />: <CheckCircleOutlined/>} type="link" onClick={copyToClipboard} />
    </div>
  );
};

export default CopyableText;
