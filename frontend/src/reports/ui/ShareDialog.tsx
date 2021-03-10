import React, { useState } from "react";
import { MadLib } from "../../utils/MadLibs";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { getMadLibPhraseText } from "../../utils/MadLibs";
import { linkToMadLib } from "../../utils/urlutils";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "@material-ui/core/Button";

function ShareDialog(props: {
  madLib: MadLib;
  shareModalOpen: boolean;
  setShareModalOpen: (shareModalOpen: boolean) => void;
}) {
  const [textCopied, setTextCopied] = useState(false);

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
          <CopyToClipboard
            text={linkToMadLib(
              props.madLib.id,
              props.madLib.activeSelections,
              true
            )}
            onCopy={() => setTextCopied(true)}
          >
            <Button startIcon={<FileCopyIcon />}>Copy link to clipboard</Button>
          </CopyToClipboard>
          {textCopied && <span>Text copied!</span>}
        </DialogContentText>
        <DialogContentText>
          <FormControl fullWidth>
            <TextField
              id="report-link"
              variant="outlined"
              defaultValue={linkToMadLib(
                props.madLib.id,
                props.madLib.activeSelections,
                true
              )}
            />
          </FormControl>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
