import React from 'react';

interface ButtonProps {
  //unnötig?
}

export const UploadButton: React.FC<ButtonProps> = () => {
  //const [file, setFile] = useState<null | File>(null); //unnötig?

  const handleClick = (uploadedFileEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputElem = uploadedFileEvent.target as HTMLInputElement & {
      files: FileList;
    };

    if (!inputElem.files[0]) {
      return;
    }

    //TODO der überprüft ja momentan noch nicht wirklich, ob das eine .tck Datei ist...
    //TODO was soll er dann mit der file anstellen? Muss ich die noch irgendwo anders abspeichern
  };

  //TODO hier noch das "Upload file" in diese Localization file tun
  return (
    <div>
      <label htmlFor="uploadFile">
        <input id="uploadFile" type="file" accept=".tck" onChange={handleClick} />
        <div className="uploadButton"> Upload file</div>
      </label>
    </div>
  );
};

export default UploadButton;
