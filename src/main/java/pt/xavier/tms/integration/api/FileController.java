package pt.xavier.tms.integration.api;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pt.xavier.tms.integration.dto.FileUploadResultDto;
import pt.xavier.tms.integration.port.FileStoragePort;
import pt.xavier.tms.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RH_INTEGRADOR')")
public class FileController {

    private final FileStoragePort fileStoragePort;

    @PostMapping
    @PreAuthorize("hasRole('RH_INTEGRADOR')")
    public ResponseEntity<ApiResponse<FileUploadResultDto>> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(fileStoragePort.upload(file)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RH_INTEGRADOR')")
    public ResponseEntity<Resource> download(@PathVariable("id") String storageKey) {
        Resource resource = fileStoragePort.download(storageKey);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(storageKey).build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
