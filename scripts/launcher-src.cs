using System;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Security;
using System.Text.RegularExpressions;
using System.Threading;

namespace AulaCIM10Launcher
{
    public class MainForm : Form
    {
        private RadioButton rbLocal;
        private RadioButton rbRemote;
        private TextBox txtRemoteUrl;
        private Button btnStart;
        private Button btnStop;
        private Button btnOpenBrowser;
        private Button btnInstallGit;
        private Label lblStatus;
        private Label lblLanUrl;
        private Button btnCopyLan;
        private Process serverProcess = null;
        private int currentPort = 3000;
        private string lanIp = "127.0.0.1";
        private string configPath;
        private string currentRepoUrl = "https://github.com/tu-usuario/proyecto-cim10-das26-27-fhsjd";

        public MainForm()
        {
            this.Text = "AulaCIM-10 · FHSJD (DAS 26/27) - Lanzador Oficial";
            this.Size = new Size(620, 580);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "launcher.config.json");

            InitializeComponents();
            DetectLanIp();
            LoadConfig();

            this.FormClosing += new FormClosingEventHandler(MainForm_FormClosing);
        }

        private void InitializeComponents()
        {
            // Header Panel
            Panel pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 85;
            pnlHeader.BackColor = Color.FromArgb(227, 6, 19); // Institutional SJD Red

            Label lblTitle = new Label();
            lblTitle.Text = "Campus Docent Sant Joan de Déu";
            lblTitle.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(20, 15);
            lblTitle.AutoSize = true;

            Label lblSubtitle = new Label();
            lblSubtitle.Text = "AulaCIM-10 · FHSJD (DAS 26/27) · Selector y Lanzador Oficial";
            lblSubtitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSubtitle.ForeColor = Color.FromArgb(254, 242, 242);
            lblSubtitle.Location = new Point(20, 42);
            lblSubtitle.AutoSize = true;

            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSubtitle);
            this.Controls.Add(pnlHeader);

            // GroupBox Mode
            GroupBox grpMode = new GroupBox();
            grpMode.Text = "  Modo de Operación  ";
            grpMode.Location = new Point(20, 95);
            grpMode.Size = new Size(565, 175);
            grpMode.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            grpMode.ForeColor = Color.FromArgb(17, 24, 39);

            rbRemote = new RadioButton();
            rbRemote.Text = "Modo 1: Acceso Directo Vercel (Producción Nube) [Recomendado]";
            rbRemote.Location = new Point(20, 25);
            rbRemote.Size = new Size(520, 25);
            rbRemote.Checked = true;
            rbRemote.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            rbRemote.ForeColor = Color.FromArgb(17, 24, 39);
            rbRemote.CheckedChanged += new EventHandler(RbMode_CheckedChanged);

            txtRemoteUrl = new TextBox();
            txtRemoteUrl.Location = new Point(42, 52);
            txtRemoteUrl.Size = new Size(495, 24);
            txtRemoteUrl.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            txtRemoteUrl.Text = "https://aulacim10-fhsjd.vercel.app";

            rbLocal = new RadioButton();
            rbLocal.Text = "Modo 2: Aula Local / Offline (SQLite WAL en este PC)";
            rbLocal.Location = new Point(20, 85);
            rbLocal.Size = new Size(520, 25);
            rbLocal.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            rbLocal.ForeColor = Color.FromArgb(17, 24, 39);
            rbLocal.CheckedChanged += new EventHandler(RbMode_CheckedChanged);

            Label lblLocalDesc = new Label();
            lblLocalDesc.Text = "Lanza el servidor en 0.0.0.0. Los alumnos acceden vía Wi-Fi/LAN del aula sin depender de internet.";
            lblLocalDesc.Location = new Point(42, 110);
            lblLocalDesc.Size = new Size(495, 30);
            lblLocalDesc.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            lblLocalDesc.ForeColor = Color.FromArgb(75, 85, 99);

            btnInstallGit = new Button();
            btnInstallGit.Text = "Instalar / Actualizar desde GitHub...";
            btnInstallGit.Location = new Point(42, 142);
            btnInstallGit.Size = new Size(250, 26);
            btnInstallGit.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            btnInstallGit.BackColor = Color.FromArgb(241, 245, 249);
            btnInstallGit.FlatStyle = FlatStyle.Flat;
            btnInstallGit.Click += new EventHandler(BtnInstallGit_Click);

            grpMode.Controls.Add(rbRemote);
            grpMode.Controls.Add(txtRemoteUrl);
            grpMode.Controls.Add(rbLocal);
            grpMode.Controls.Add(lblLocalDesc);
            grpMode.Controls.Add(btnInstallGit);
            this.Controls.Add(grpMode);

            // Server & Network Status Panel
            GroupBox grpStatus = new GroupBox();
            grpStatus.Text = "  Estado de Conectividad y Red  ";
            grpStatus.Location = new Point(20, 280);
            grpStatus.Size = new Size(565, 125);
            grpStatus.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            grpStatus.ForeColor = Color.FromArgb(17, 24, 39);

            lblStatus = new Label();
            lblStatus.Text = "Modo Web: Listo para abrir versión desplegada.";
            lblStatus.Location = new Point(20, 28);
            lblStatus.Size = new Size(520, 22);
            lblStatus.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(75, 85, 99);

            lblLanUrl = new Label();
            lblLanUrl.Text = "Destino Web: https://aulacim10-fhsjd.vercel.app";
            lblLanUrl.Location = new Point(20, 56);
            lblLanUrl.Size = new Size(410, 22);
            lblLanUrl.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            lblLanUrl.ForeColor = Color.FromArgb(0, 119, 182); // Docent Blue

            btnCopyLan = new Button();
            btnCopyLan.Text = "Copiar URL";
            btnCopyLan.Location = new Point(440, 51);
            btnCopyLan.Size = new Size(105, 30);
            btnCopyLan.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            btnCopyLan.BackColor = Color.FromArgb(241, 245, 249);
            btnCopyLan.FlatStyle = FlatStyle.Flat;
            btnCopyLan.Enabled = false;
            btnCopyLan.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnCopyLan.Click += new EventHandler(BtnCopyLan_Click);

            Label lblFootnote = new Label();
            lblFootnote.Text = "Pizarra Proyectable en /pizarra · Blindaje CISO y Cero PII activo";
            lblFootnote.Location = new Point(20, 92);
            lblFootnote.Size = new Size(520, 20);
            lblFootnote.Font = new Font("Segoe UI", 8.0f, FontStyle.Italic);
            lblFootnote.ForeColor = Color.FromArgb(156, 163, 175);

            grpStatus.Controls.Add(lblStatus);
            grpStatus.Controls.Add(lblLanUrl);
            grpStatus.Controls.Add(btnCopyLan);
            grpStatus.Controls.Add(lblFootnote);
            this.Controls.Add(grpStatus);

            // Action Buttons
            btnStart = new Button();
            btnStart.Text = "Abrir en Vercel";
            btnStart.Location = new Point(20, 420);
            btnStart.Size = new Size(170, 44);
            btnStart.BackColor = Color.FromArgb(227, 6, 19);
            btnStart.ForeColor = Color.White;
            btnStart.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btnStart.FlatStyle = FlatStyle.Flat;
            btnStart.Cursor = Cursors.Hand;
            btnStart.FlatAppearance.BorderSize = 0;
            btnStart.Click += new EventHandler(BtnStart_Click);

            btnStop = new Button();
            btnStop.Text = "Detener Servidor";
            btnStop.Location = new Point(200, 420);
            btnStop.Size = new Size(150, 44);
            btnStop.BackColor = Color.FromArgb(226, 232, 240);
            btnStop.ForeColor = Color.FromArgb(71, 85, 105);
            btnStop.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnStop.FlatStyle = FlatStyle.Flat;
            btnStop.Enabled = false;
            btnStop.FlatAppearance.BorderSize = 0;
            btnStop.Click += new EventHandler(BtnStop_Click);

            btnOpenBrowser = new Button();
            btnOpenBrowser.Text = "Abrir Navegador";
            btnOpenBrowser.Location = new Point(360, 420);
            btnOpenBrowser.Size = new Size(225, 44);
            btnOpenBrowser.BackColor = Color.FromArgb(0, 119, 182);
            btnOpenBrowser.ForeColor = Color.White;
            btnOpenBrowser.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnOpenBrowser.FlatStyle = FlatStyle.Flat;
            btnOpenBrowser.Cursor = Cursors.Hand;
            btnOpenBrowser.FlatAppearance.BorderSize = 0;
            btnOpenBrowser.Click += new EventHandler(BtnOpenBrowser_Click);

            this.Controls.Add(btnStart);
            this.Controls.Add(btnStop);
            this.Controls.Add(btnOpenBrowser);
        }

        private void RbMode_CheckedChanged(object sender, EventArgs e)
        {
            ToggleMode();
        }

        private void ToggleMode()
        {
            txtRemoteUrl.Enabled = rbRemote.Checked;
            if (rbRemote.Checked)
            {
                btnStart.Text = "Abrir en Vercel";
                lblStatus.Text = "Modo Web: Listo para abrir versión desplegada.";
                lblLanUrl.Text = "Destino Web: " + txtRemoteUrl.Text;
                btnCopyLan.Enabled = false;
            }
            else
            {
                btnStart.Text = "Iniciar Aula Local";
                lblStatus.Text = serverProcess != null && !serverProcess.HasExited ? "Servidor activo en puerto " + currentPort : "Estado: Servidor detenido.";
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    lblLanUrl.Text = "URL Alumnos (LAN): http://" + lanIp + ":" + currentPort;
                    btnCopyLan.Enabled = true;
                }
                else
                {
                    lblLanUrl.Text = "URL Alumnos (LAN): Pendiente de iniciar servidor...";
                    btnCopyLan.Enabled = false;
                }
            }
        }

        private bool ValidateUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return false;
            Uri uriResult;
            bool result = Uri.TryCreate(url, UriKind.Absolute, out uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
            return result;
        }

        private void DetectLanIp()
        {
            try
            {
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint endPoint = socket.LocalEndPoint as IPEndPoint;
                    if (endPoint != null)
                    {
                        lanIp = endPoint.Address.ToString();
                        return;
                    }
                }
            }
            catch
            {
                try
                {
                    string host = Dns.GetHostName();
                    IPHostEntry entry = Dns.GetHostEntry(host);
                    foreach (IPAddress ip in entry.AddressList)
                    {
                        if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
                        {
                            lanIp = ip.ToString();
                            break;
                        }
                    }
                }
                catch { lanIp = "127.0.0.1"; }
            }
        }

        private int FindFreePort(int startPort)
        {
            for (int p = startPort; p <= 3099; p++)
            {
                try
                {
                    TcpListener listener = new TcpListener(IPAddress.Any, p);
                    listener.Start();
                    listener.Stop();
                    return p;
                }
                catch { }
            }
            return startPort;
        }

        private void BtnStart_Click(object sender, EventArgs e)
        {
            if (rbRemote.Checked)
            {
                SaveConfig();
                string url = txtRemoteUrl.Text.Trim();
                if (!ValidateUrl(url))
                {
                    MessageBox.Show("La URL introducida no es válida. Debe comenzar estrictamente por https:// o http://", "Validación CISO", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                Process.Start(url);
                return;
            }

            // Modo Local
            if (serverProcess != null && !serverProcess.HasExited)
            {
                MessageBox.Show("El servidor ya se encuentra en ejecución.", "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            currentPort = FindFreePort(3000);

            lblStatus.Text = "Iniciando servidor Next.js en puerto " + currentPort + "...";
            lblStatus.ForeColor = Color.FromArgb(202, 138, 4);

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.WorkingDirectory = baseDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;

                string localNodeDir = Path.Combine(baseDir, "runtime", "node");
                string localNodeExe = Path.Combine(localNodeDir, "node.exe");
                string nextBin = Path.Combine(baseDir, "node_modules", "next", "dist", "bin", "next");

                // Inject runtime\node at the beginning of PATH for child processes
                string currentPath = Environment.GetEnvironmentVariable("PATH") ?? "";
                if (Directory.Exists(localNodeDir))
                {
                    psi.EnvironmentVariables["PATH"] = localNodeDir + Path.PathSeparator + currentPath;
                }

                if (File.Exists(localNodeExe) && File.Exists(nextBin))
                {
                    psi.FileName = localNodeExe;
                    psi.Arguments = string.Format("\"{0}\" start -H 0.0.0.0 -p {1}", nextBin, currentPort);
                }
                else
                {
                    psi.FileName = "cmd.exe";
                    psi.Arguments = string.Format("/c npx next start -H 0.0.0.0 -p {0}", currentPort);
                }

                serverProcess = Process.Start(psi);

                lblStatus.Text = "Servidor ACTIVO en 0.0.0.0:" + currentPort;
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);

                string studentUrl = "http://" + lanIp + ":" + currentPort;
                lblLanUrl.Text = "URL Alumnos (LAN): " + studentUrl;
                btnCopyLan.Tag = studentUrl;
                btnCopyLan.Enabled = true;

                btnStart.Enabled = false;
                btnStop.Enabled = true;

                SaveConfig();

                ThreadPool.QueueUserWorkItem(new WaitCallback(OpenBrowserDelayed));
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al arrancar servidor: " + ex.Message, "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Error);
                lblStatus.Text = "Error al iniciar servidor.";
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
            }
        }

        private void OpenBrowserDelayed(object state)
        {
            Thread.Sleep(1800);
            try
            {
                Process.Start("http://localhost:" + currentPort);
            }
            catch { }
        }

        private void BtnStop_Click(object sender, EventArgs e)
        {
            StopServer();
        }

        private void StopServer()
        {
            if (serverProcess != null)
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = "taskkill";
                    psi.Arguments = "/F /T /PID " + serverProcess.Id;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    Process pKill = Process.Start(psi);
                    if (pKill != null) pKill.WaitForExit(3000);
                }
                catch { }

                try { if (!serverProcess.HasExited) serverProcess.Kill(); } catch { }
                serverProcess = null;
            }

            lblStatus.Text = "Estado: Servidor detenido.";
            lblStatus.ForeColor = Color.FromArgb(107, 114, 128);
            lblLanUrl.Text = "URL Alumnos (LAN): Servidor detenido";
            btnCopyLan.Enabled = false;

            btnStart.Enabled = true;
            btnStop.Enabled = false;
        }

        private void BtnCopyLan_Click(object sender, EventArgs e)
        {
            if (btnCopyLan.Tag != null)
            {
                Clipboard.SetText(btnCopyLan.Tag.ToString());
                MessageBox.Show("URL de red local copiada al portapapeles:\n" + btnCopyLan.Tag.ToString(), "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void BtnOpenBrowser_Click(object sender, EventArgs e)
        {
            if (rbRemote.Checked)
            {
                string url = txtRemoteUrl.Text.Trim();
                if (ValidateUrl(url)) Process.Start(url);
            }
            else
            {
                Process.Start("http://localhost:" + currentPort);
            }
        }

        private void BtnInstallGit_Click(object sender, EventArgs e)
        {
            using (FolderBrowserDialog fbd = new FolderBrowserDialog())
            {
                fbd.Description = "Selecciona la carpeta donde deseas instalar o actualizar AulaCIM-10 desde GitHub:";
                fbd.ShowNewFolderButton = true;
                if (fbd.ShowDialog() == DialogResult.OK)
                {
                    string targetDir = fbd.SelectedPath;
                    lblStatus.Text = "Instalando repositorio en: " + targetDir;
                    lblStatus.ForeColor = Color.FromArgb(202, 138, 4);

                    ThreadPool.QueueUserWorkItem((state) =>
                    {
                        try
                        {
                            bool hasGit = false;
                            try
                            {
                                Process pGit = Process.Start(new ProcessStartInfo("git", "--version") { CreateNoWindow = true, UseShellExecute = false });
                                pGit.WaitForExit(2000);
                                hasGit = (pGit.ExitCode == 0);
                            }
                            catch { hasGit = false; }

                            if (hasGit)
                            {
                                // Clone or pull
                                string gitDir = Path.Combine(targetDir, ".git");
                                ProcessStartInfo psi = new ProcessStartInfo();
                                psi.FileName = "git";
                                psi.CreateNoWindow = true;
                                psi.UseShellExecute = false;

                                if (Directory.Exists(gitDir))
                                {
                                    psi.Arguments = "pull";
                                    psi.WorkingDirectory = targetDir;
                                }
                                else
                                {
                                    psi.Arguments = string.Format("clone {0} .", currentRepoUrl);
                                    psi.WorkingDirectory = targetDir;
                                }

                                Process proc = Process.Start(psi);
                                proc.WaitForExit(60000);
                            }
                            else
                            {
                                // Download ZIP fallback
                                string zipUrl = currentRepoUrl.TrimEnd('/') + "/archive/refs/heads/main.zip";
                                string tempZip = Path.Combine(Path.GetTempPath(), "aulacim_repo_" + Guid.NewGuid().ToString("N") + ".zip");
                                using (WebClient client = new WebClient())
                                {
                                    client.DownloadFile(zipUrl, tempZip);
                                }

                                // Extract safely avoiding Zip Slip
                                using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                                {
                                    string fullDest = Path.GetFullPath(targetDir);
                                    foreach (ZipArchiveEntry entry in archive.Entries)
                                    {
                                        // Strip root archive folder if present
                                        string relPath = entry.FullName;
                                        int slashIdx = relPath.IndexOf('/');
                                        if (slashIdx >= 0) relPath = relPath.Substring(slashIdx + 1);
                                        if (string.IsNullOrEmpty(relPath)) continue;

                                        string destFile = Path.GetFullPath(Path.Combine(fullDest, relPath));
                                        if (!destFile.StartsWith(fullDest, StringComparison.OrdinalIgnoreCase))
                                        {
                                            throw new SecurityException("Zip Slip detectado en entrada de archivo.");
                                        }

                                        if (entry.FullName.EndsWith("/"))
                                        {
                                            Directory.CreateDirectory(destFile);
                                        }
                                        else
                                        {
                                            Directory.CreateDirectory(Path.GetDirectoryName(destFile));
                                            entry.ExtractToFile(destFile, true);
                                        }
                                    }
                                }
                                try { File.Delete(tempZip); } catch { }
                            }

                            this.Invoke((MethodInvoker)delegate
                            {
                                lblStatus.Text = "Instalación/Actualización desde GitHub completada con éxito.";
                                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);
                                MessageBox.Show("Repositorio instalado/actualizado correctamente en:\n" + targetDir, "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            });
                        }
                        catch (Exception ex)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                lblStatus.Text = "Error en la instalación desde GitHub: " + ex.Message;
                                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                                MessageBox.Show("Error durante la instalación: " + ex.Message, "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            });
                        }
                    });
                }
            }
        }

        private void LoadConfig()
        {
            try
            {
                if (File.Exists(configPath))
                {
                    string json = File.ReadAllText(configPath);
                    Match mUrl = Regex.Match(json, "\"remoteUrl\"\\s*:\\s*\"([^\"]+)\"");
                    if (mUrl.Success) txtRemoteUrl.Text = mUrl.Groups[1].Value;

                    Match mRepo = Regex.Match(json, "\"repoUrl\"\\s*:\\s*\"([^\"]+)\"");
                    if (mRepo.Success) currentRepoUrl = mRepo.Groups[1].Value;

                    Match mMode = Regex.Match(json, "\"preferredMode\"\\s*:\\s*\"([^\"]+)\"");
                    if (mMode.Success && mMode.Groups[1].Value == "local")
                    {
                        rbLocal.Checked = true;
                    }
                    else
                    {
                        rbRemote.Checked = true;
                    }
                    ToggleMode();
                }
            }
            catch { }
        }

        private void SaveConfig()
        {
            try
            {
                string mode = rbRemote.Checked ? "remote" : "local";
                string json = string.Format("{{\n  \"remoteUrl\": \"{0}\",\n  \"preferredMode\": \"{1}\",\n  \"autoOpenBrowser\": true,\n  \"repoUrl\": \"{2}\"\n}}\n",
                    txtRemoteUrl.Text.Trim(), mode, currentRepoUrl.Trim());
                File.WriteAllText(configPath, json);
            }
            catch { }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            StopServer();
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }
}
