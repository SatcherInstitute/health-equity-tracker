import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getMadLibPhraseText, MadLib } from "../../utils/MadLibs";

function ShareDialog(props: {
  madLib: MadLib;
  shareModalOpen: boolean;
  setShareModalOpen: (shareModalOpen: boolean) => void;
}) {
  const [textCopied, setTextCopied] = useState(false);
  const text = window.location.href;

  return (
    <Dialog
      open={props.shareModalOpen}
      onClose={() => {
        props.setShareModalOpen(false);
        setTextCopied(false);
      }}
      aria-labelledby="share-dialog"
    >
      <DialogTitle>{getMadLibPhraseText(props.madLib)}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <CopyToClipboard text={text} onCopy={() => setTextCopied(true)}>
            <Button startIcon={<FileCopyIcon />}>Copy link to clipboard</Button>
          </CopyToClipboard>
          {textCopied && <span>Text copied!</span>}
        </DialogContentText>
        <DialogContentText>
          <FormControl fullWidth>
            <TextField
              id="report-link"
              variant="outlined"
              defaultValue={text}
            />
          </FormControl>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
